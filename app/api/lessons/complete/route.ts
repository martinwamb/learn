import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkMilestones } from "@/lib/email/milestones";

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isNextUtcDay(prev: Date, now: Date): boolean {
  const prevDay = Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate());
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return nowDay - prevDay === 86_400_000;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, score, kind } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const userId = session.user.id;
  // Three content types share this endpoint because they share LessonPlayer. Each has
  // its own nullable FK on UserProgress (the pattern the Book/ReligiousLesson types
  // already established) rather than a polymorphic id column, so the database still
  // enforces that a progress row points at something real.
  const type: "lesson" | "religious-lesson" | "story" =
    kind === "religious-lesson" ? "religious-lesson" : kind === "story" ? "story" : "lesson";

  const where =
    type === "religious-lesson"
      ? { userId_religiousLessonId: { userId, religiousLessonId: lessonId } }
      : type === "story"
      ? { userId_storyId: { userId, storyId: lessonId } }
      : { userId_lessonId: { userId, lessonId } };

  const fk =
    type === "religious-lesson"
      ? { religiousLessonId: lessonId }
      : type === "story"
      ? { storyId: lessonId }
      : { lessonId };

  await db.userProgress.upsert({
    where,
    update: { completed: true, score, completedAt: new Date() },
    create: {
      userId,
      ...fk,
      type,
      completed: true,
      score,
      completedAt: new Date(),
    },
  });

  // Streak: consecutive calendar days (UTC) with at least one completion. Same-day
  // completions don't double-count; a gap of 2+ days resets to 1. This was
  // previously write-only (always hardcoded to 1 on create, never updated) --
  // effectively dead despite being shown on the dashboard.
  const now = new Date();
  const existingProfile = await db.userProfile.findUnique({ where: { userId } });
  let newStreak = 1;
  if (existingProfile) {
    if (isSameUtcDay(existingProfile.lastActive, now)) newStreak = existingProfile.streak;
    else if (isNextUtcDay(existingProfile.lastActive, now)) newStreak = existingProfile.streak + 1;
  }
  const newTotalPoints = (existingProfile?.totalPoints ?? 0) + (score ?? 0);

  await db.userProfile.upsert({
    where: { userId },
    update: { totalPoints: newTotalPoints, lastActive: now, streak: newStreak },
    create: { userId, gradeCode: "G1", totalPoints: score ?? 0, streak: 1, lastActive: now },
  });

  // Fire-and-forget -- doesn't block the completion response on an SMTP round trip.
  checkMilestones(db, userId, newStreak, newTotalPoints).catch((err) =>
    console.error("checkMilestones error:", err)
  );

  return NextResponse.json({ ok: true });
}
