import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, score, kind } = await req.json();
  if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

  const userId = session.user.id;
  const isReligious = kind === "religious-lesson";

  await db.userProgress.upsert({
    where: isReligious
      ? { userId_religiousLessonId: { userId, religiousLessonId: lessonId } }
      : { userId_lessonId: { userId, lessonId } },
    update: { completed: true, score, completedAt: new Date() },
    create: {
      userId,
      ...(isReligious ? { religiousLessonId: lessonId } : { lessonId }),
      type: isReligious ? "religious-lesson" : "lesson",
      completed: true,
      score,
      completedAt: new Date(),
    },
  });

  // Update streak and points on profile
  await db.userProfile.upsert({
    where: { userId },
    update: {
      totalPoints: { increment: score ?? 0 },
      lastActive: new Date(),
    },
    create: {
      userId,
      gradeCode: "G1",
      totalPoints: score ?? 0,
      streak: 1,
      lastActive: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
