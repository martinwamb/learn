/**
 * Progress Digest Email Worker — runs weekly via PM2 cron. Summarizes lessons
 * completed, streak, and total points for users who were actually active in the
 * past week (a digest for zero activity isn't useful -- that's what the inactivity
 * nudge worker is for).
 *
 * PM2: pm2 start workers/email-digest.js --name learn-email-digest --cron "50 1 * * 0"
 * (Sundays only, 01:50 UTC)
 */
import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { sendEmail } from "../lib/email/send";
import { digestEmailHtml } from "../lib/email/templates";
import { makeUnsubscribeToken } from "../lib/email/token";

const db = createScriptDb();
const WEEK_MS = 7 * 86_400_000;

async function run() {
  const start = Date.now();
  console.log(`\n✉️  Progress Digest Worker started at ${new Date().toISOString()}`);

  const weekAgo = new Date(Date.now() - WEEK_MS);

  const activeProfiles = await db.userProfile.findMany({
    where: { emailOptIn: true, lastActive: { gt: weekAgo } },
    include: { user: true },
  });

  console.log(`Found ${activeProfiles.length} users active in the past week`);
  let sent = 0;
  const errors: string[] = [];

  for (const profile of activeProfiles) {
    if (!profile.user.email) continue;

    const lessonsCompleted = await db.userProgress.count({
      where: {
        userId: profile.userId,
        completed: true,
        type: { in: ["lesson", "religious-lesson"] },
        completedAt: { gt: weekAgo },
      },
    });
    if (lessonsCompleted === 0) continue; // active (e.g. read a book) but no lessons -- skip

    const firstName = (profile.user.name ?? "").split(" ")[0] || "Friend";
    const token = makeUnsubscribeToken(profile.userId);
    const unsubscribeUrl = `https://learn.wambugumartin.com/api/email/unsubscribe?userId=${profile.userId}&token=${token}`;
    const subject = "Your weekly progress at Learn 🎉";

    try {
      await sendEmail(
        profile.user.email,
        subject,
        digestEmailHtml(
          firstName,
          { lessonsCompleted, streak: profile.streak, totalPoints: profile.totalPoints },
          unsubscribeUrl
        )
      );
      await db.emailLog.create({ data: { userId: profile.userId, type: "digest", subject } });
      sent++;
      console.log(`  ✓ ${profile.user.email} (${lessonsCompleted} lessons)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${profile.user.email}: ${msg}`);
      errors.push(`${profile.user.email}: ${msg}`);
    }
  }

  console.log(`\n✅ Progress Digest Worker done — ${sent} sent, ${((Date.now() - start) / 1000).toFixed(1)}s`);
  if (errors.length) console.log(`   ${errors.length} error(s)`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Progress Digest Worker fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
