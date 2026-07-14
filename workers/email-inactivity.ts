/**
 * Inactivity Email Worker — runs nightly via PM2 cron. Finds users who haven't been
 * active recently and haven't already been nudged this week, sends an encouraging
 * "come back" email, logs it.
 *
 * PM2: pm2 start workers/email-inactivity.js --name learn-email-inactivity --cron "45 1 * * *"
 * (01:45 UTC -- clear of learn-story-worker at 01:15, port's 02:00, publisher-site's
 * 02:30/03:00)
 */
import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { sendEmail } from "../lib/email/send";
import { inactivityEmailHtml } from "../lib/email/templates";
import { makeUnsubscribeToken } from "../lib/email/token";

const db = createScriptDb();
const INACTIVE_DAYS = Number(process.env.EMAIL_INACTIVE_DAYS ?? 3);
const REPEAT_COOLDOWN_DAYS = 7; // don't re-nudge a still-inactive user every single night

async function run() {
  const start = Date.now();
  console.log(`\n✉️  Inactivity Email Worker started at ${new Date().toISOString()}`);

  const cutoff = new Date(Date.now() - INACTIVE_DAYS * 86_400_000);
  const cooldownCutoff = new Date(Date.now() - REPEAT_COOLDOWN_DAYS * 86_400_000);

  const candidates = await db.userProfile.findMany({
    where: { emailOptIn: true, lastActive: { lt: cutoff } },
    include: { user: true },
  });

  console.log(`Found ${candidates.length} inactive, opted-in users`);
  let sent = 0;
  const errors: string[] = [];

  for (const profile of candidates) {
    if (!profile.user.email) continue;

    const recentNudge = await db.emailLog.findFirst({
      where: { userId: profile.userId, type: "inactivity", sentAt: { gt: cooldownCutoff } },
    });
    if (recentNudge) continue;

    const firstName = (profile.user.name ?? "").split(" ")[0] || "Friend";
    const token = makeUnsubscribeToken(profile.userId);
    const unsubscribeUrl = `https://learn.wambugumartin.com/api/email/unsubscribe?userId=${profile.userId}&token=${token}`;
    const subject = "We miss you at Learn! 🦒";

    try {
      await sendEmail(profile.user.email, subject, inactivityEmailHtml(firstName, unsubscribeUrl));
      await db.emailLog.create({ data: { userId: profile.userId, type: "inactivity", subject } });
      sent++;
      console.log(`  ✓ ${profile.user.email}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ ${profile.user.email}: ${msg}`);
      errors.push(`${profile.user.email}: ${msg}`);
    }
  }

  console.log(`\n✅ Inactivity Email Worker done — ${sent} sent, ${((Date.now() - start) / 1000).toFixed(1)}s`);
  if (errors.length) console.log(`   ${errors.length} error(s)`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Inactivity Email Worker fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
