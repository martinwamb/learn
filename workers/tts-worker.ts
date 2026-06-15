/**
 * TTS Worker — runs as a standalone PM2 process on a nightly cron (02:00 EAT).
 * Fetches books where audioStatus = "pending", generates pre-produced narrative
 * audio using Kokoro TTS (multiple voices), stitches with ffmpeg, saves MP3.
 *
 * PM2: pm2 start workers/tts-worker.js --name learn-tts-worker --cron "0 2 * * *"
 */

import "dotenv/config";
import path from "path";
import { promises as fs } from "fs";
import { createScriptDb } from "../lib/db-script";
import { parseStoryText } from "../lib/tts/text-parser";
import { textToWav } from "../lib/tts/kokoro";
import { stitchToMp3 } from "../lib/tts/stitch";

const db = createScriptDb();
const AUDIO_DIR = path.resolve(process.env.AUDIO_DIR ?? "./public/audio/books");
const MAX_BOOKS_PER_RUN = Number(process.env.TTS_MAX_PER_RUN ?? 10);

async function ensureAudioDir() {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
}

async function processBook(bookId: string): Promise<void> {
  const book = await db.book.findUnique({ where: { id: bookId } });
  if (!book || !book.text) {
    console.warn(`  [skip] Book ${bookId} has no text`);
    return;
  }

  await db.book.update({ where: { id: bookId }, data: { audioStatus: "processing" } });

  const { segments, voiceMap } = parseStoryText(book.text);
  console.log(`  ✦ "${book.title}" — ${segments.length} segments, voices: ${JSON.stringify(voiceMap)}`);

  // Save segment plan to DB
  await db.book.update({
    where: { id: bookId },
    data: { segmentPlan: segments as never },
  });

  // Generate WAV for each segment
  const wavFiles: string[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const wav = await textToWav(seg.text, seg.voice, i);
    wavFiles.push(wav);
    process.stdout.write(`    segment ${i + 1}/${segments.length}\r`);
  }
  console.log();

  // Stitch into final MP3
  const outputFilename = `${bookId}.mp3`;
  const outputPath = path.join(AUDIO_DIR, outputFilename);
  await stitchToMp3(wavFiles, outputPath);

  const audioPath = `/audio/books/${outputFilename}`;
  await db.book.update({
    where: { id: bookId },
    data: { audioStatus: "ready", audioPath },
  });

  console.log(`  ✅ "${book.title}" → ${audioPath}`);
}

async function run() {
  const start = Date.now();
  console.log(`\n🎙️  TTS Worker started at ${new Date().toISOString()}`);

  await ensureAudioDir();

  const pending = await db.book.findMany({
    where: { audioStatus: "pending", text: { not: null } },
    orderBy: { createdAt: "asc" },
    take: MAX_BOOKS_PER_RUN,
  });

  console.log(`Found ${pending.length} pending books`);
  let processed = 0;
  const errors: string[] = [];

  for (const book of pending) {
    try {
      await processBook(book.id);
      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ "${book.title}": ${msg}`);
      errors.push(`${book.title}: ${msg}`);
      await db.book.update({
        where: { id: book.id },
        data: { audioStatus: "failed" },
      }).catch(() => {});
    }
  }

  const durationMs = Date.now() - start;
  await db.generatorLog.create({
    data: {
      workerType: "tts",
      booksProcessed: processed,
      errors,
      durationMs,
    },
  });

  console.log(`\n✅ TTS Worker done — ${processed}/${pending.length} books, ${(durationMs / 1000).toFixed(1)}s`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("TTS Worker fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
