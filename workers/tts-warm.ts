/**
 * TTS Warm Worker — pre-generates narration audio for every published lesson, faith
 * lesson and Jina story, so no child ever waits on a synthesis while a screen sits
 * blank in front of them.
 *
 * Narration used to be synthesized on demand, inline, the first time anyone opened a
 * screen: an edge-tts spawn measured at ~1s for a single short sentence on this box,
 * plus a second round trip for the MP3 -- paid by whichever child happened to reach
 * that screen first. This worker moves that cost to 03:40 UTC, where nobody is waiting.
 *
 * Correctness depends entirely on producing byte-identical strings to the ones the
 * browser will later request, which is why the narration text lives in
 * lib/lesson/narration.ts and is imported by both sides rather than duplicated.
 *
 * PM2: pm2 start "npm run worker:tts-warm" --name learn-tts-warm --cron "15 22 * * *"
 */

import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { buildScreens, type LessonData } from "../lib/lesson/screens";
import { collectFeedbackNarrations, collectLessonNarrations } from "../lib/lesson/narration";
import { storyToLessonData } from "../lib/story/to-lesson-data";
import { ensureAudio, isCached, mapWithConcurrency, resolveEntry } from "../lib/tts/cache";

const db = createScriptDb();

// A full sweep of today's ~200 published items is 1864 distinct lines. Measured against
// production: ~2.4s per clip at concurrency 3 under `nice -n 15` while the app is
// serving, so 1200 is roughly a 50-minute run and the backlog converges in two nights.
// The cache is cumulative, so after that this is a near-no-op that only pays for newly
// published content. If you raise this, check it still fits the cron slot -- see the
// timing note beside the PM2 line in .github/workflows/deploy.yml.
const MAX_PER_RUN = Number(process.env.TTS_WARM_MAX_PER_RUN ?? 1200);
// edge-tts is network-bound (WebSocket to Microsoft, no local model), but this box runs
// six other PM2 apps, so parallelism stays small and `nice`d.
const CONCURRENCY = Number(process.env.TTS_WARM_CONCURRENCY ?? 3);

function narrationsFor(lesson: LessonData): string[] {
  const screens = buildScreens(lesson);
  return [...collectLessonNarrations(lesson, screens), ...collectFeedbackNarrations(lesson)];
}

async function collectAllTexts(): Promise<string[]> {
  const texts = new Set<string>();

  const [lessons, religiousLessons, stories] = await Promise.all([
    db.lesson.findMany({
      where: { status: "published" },
      select: { title: true, objective: true, content: true, activities: true, funFact: true },
    }),
    db.religiousLesson.findMany({
      where: { status: "published" },
      select: { title: true, objective: true, content: true, activities: true, funFact: true },
    }),
    db.story.findMany({
      where: { status: "published" },
      select: { title: true, objective: true, pages: true, activities: true, funFact: true },
    }),
  ]);

  for (const lesson of [...lessons, ...religiousLessons]) {
    for (const text of narrationsFor(lesson as unknown as LessonData)) texts.add(text);
  }
  for (const story of stories) {
    for (const text of narrationsFor(storyToLessonData(story))) texts.add(text);
  }

  return [...texts];
}

async function run() {
  const start = Date.now();
  console.log(`\n🔊 TTS Warm Worker started at ${new Date().toISOString()}`);

  const allTexts = await collectAllTexts();
  console.log(`Collected ${allTexts.length} distinct narration lines across published content`);

  // Filter to genuine misses first so MAX_PER_RUN budgets real synthesis work rather
  // than being spent re-checking clips that are already on disk.
  const missing: string[] = [];
  await mapWithConcurrency(allTexts, 16, async (text) => {
    if (!(await isCached(resolveEntry(text)))) missing.push(text);
  });

  const batch = missing.slice(0, MAX_PER_RUN);
  console.log(
    `${missing.length} missing from cache — generating ${batch.length} this run` +
      (missing.length > batch.length ? ` (${missing.length - batch.length} deferred to the next run)` : "")
  );

  let generated = 0;
  const errors: string[] = [];

  await mapWithConcurrency(batch, CONCURRENCY, async (text) => {
    try {
      await ensureAudio(text);
      generated++;
      if (generated % 25 === 0) process.stdout.write(`    ${generated}/${batch.length}\r`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Truncated so one pathological line can't flood the GeneratorLog row.
      errors.push(`${text.slice(0, 60)}...: ${msg}`.slice(0, 300));
    }
  });

  const durationMs = Date.now() - start;
  await db.generatorLog.create({
    data: {
      workerType: "tts-warm",
      // Reuses booksProcessed as the generic "items handled" counter rather than adding
      // a clip-specific column to a table shared by five workers.
      booksProcessed: generated,
      errors: errors.slice(0, 20),
      durationMs,
    },
  });

  console.log(
    `\n✅ TTS Warm done — ${generated} clip(s) generated, ${errors.length} error(s), ${(durationMs / 1000).toFixed(1)}s`
  );
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("TTS Warm Worker fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
