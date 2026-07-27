import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkMilestones } from "@/lib/email/milestones";

// Games award points and keep the daily streak alive, but deliberately do NOT write a
// UserProgress row.
//
// UserProgress means "this child has completed this piece of curriculum", and it drives
// the completion ticks in the lesson/story lists. A game is replayable by design (that's
// the whole point of GameHost's "Play again"), so recording one as completion would
// either mark a lesson done that was never read, or need a fourth nullable FK for a
// thing that has no fixed end state. Points and streak are the parts that genuinely
// belong to the child's daily activity.

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

  const { score } = await req.json();
  const userId = session.user.id;

  // Clamped server-side: the score arrives from the browser, and a game's maximum is
  // 10 points per item with at most 10 items per engine.
  const points = Math.max(0, Math.min(Number(score) || 0, 100));

  const now = new Date();
  const existingProfile = await db.userProfile.findUnique({ where: { userId } });
  let newStreak = 1;
  if (existingProfile) {
    if (isSameUtcDay(existingProfile.lastActive, now)) newStreak = existingProfile.streak;
    else if (isNextUtcDay(existingProfile.lastActive, now)) newStreak = existingProfile.streak + 1;
  }
  const newTotalPoints = (existingProfile?.totalPoints ?? 0) + points;

  await db.userProfile.upsert({
    where: { userId },
    update: { totalPoints: newTotalPoints, lastActive: now, streak: newStreak },
    create: { userId, gradeCode: "G1", totalPoints: points, streak: 1, lastActive: now },
  });

  checkMilestones(db, userId, newStreak, newTotalPoints).catch((err) =>
    console.error("checkMilestones error:", err)
  );

  return NextResponse.json({ ok: true, points: newTotalPoints });
}
