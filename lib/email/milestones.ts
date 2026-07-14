import type { PrismaClient } from "@/lib/generated/prisma/client";
import { sendEmail } from "./send";
import { milestoneEmailHtml } from "./templates";
import { makeUnsubscribeToken } from "./token";

const STREAK_MILESTONES = [7, 30, 100];
const POINTS_MILESTONES = [100, 500, 1000, 5000];

// Called fire-and-forget from app/api/lessons/complete/route.ts right after progress
// is recorded. A small, easily-extended rule set -- checks each candidate milestone
// against email history (by subject, which encodes the specific milestone) so
// nothing fires twice.
export async function checkMilestones(
  db: PrismaClient,
  userId: string,
  newStreak: number,
  newTotalPoints: number
): Promise<void> {
  const profile = await db.userProfile.findUnique({ where: { userId }, include: { user: true } });
  if (!profile?.emailOptIn || !profile.user.email) return;

  const candidates: { subject: string; title: string; description: string }[] = [];

  const totalCompleted = await db.userProgress.count({
    where: { userId, completed: true, type: { in: ["lesson", "religious-lesson"] } },
  });
  if (totalCompleted === 1) {
    candidates.push({
      subject: "🎉 First Lesson Complete!",
      title: "You finished your first lesson!",
      description: "This is just the beginning of your learning journey with Jina.",
    });
  }

  for (const days of STREAK_MILESTONES) {
    if (newStreak === days) {
      candidates.push({
        subject: `🔥 ${days}-Day Streak!`,
        title: `${days} days in a row!`,
        description: `You've kept your learning streak alive for ${days} days straight. Incredible dedication!`,
      });
    }
  }

  for (const points of POINTS_MILESTONES) {
    if (newTotalPoints >= points) {
      candidates.push({
        subject: `⭐ ${points} Points!`,
        title: `You've earned ${points} points!`,
        description: "Every lesson adds up -- keep collecting stars!",
      });
    }
  }

  if (!candidates.length) return;

  const alreadySent = new Set(
    (await db.emailLog.findMany({ where: { userId, type: "milestone" }, select: { subject: true } })).map(
      (e) => e.subject
    )
  );
  const newMilestones = candidates.filter((c) => !alreadySent.has(c.subject));
  if (!newMilestones.length) return;

  const firstName = (profile.user.name ?? "").split(" ")[0] || "Friend";
  const token = makeUnsubscribeToken(userId);
  const unsubscribeUrl = `https://learn.wambugumartin.com/api/email/unsubscribe?userId=${userId}&token=${token}`;

  for (const milestone of newMilestones) {
    try {
      await sendEmail(profile.user.email, milestone.subject, milestoneEmailHtml(firstName, milestone, unsubscribeUrl));
      await db.emailLog.create({ data: { userId, type: "milestone", subject: milestone.subject } });
    } catch (err) {
      console.error(`Milestone email failed for ${profile.user.email}:`, err);
    }
  }
}
