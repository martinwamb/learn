// Content-addressed narration cache, shared by app/api/tts/speak, app/api/tts/prepare
// and workers/tts-warm.ts. Every caller must hash and write identically or they'd each
// generate their own copy of the same audio and none would hit the others' entries.

import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { generateSpeech, DEFAULT_NARRATOR_VOICE } from "./edge-tts";
import { stitchToMp3 } from "./stitch";
import os from "os";

export const CACHE_DIR = path.resolve(/* turbopackIgnore: true */ "./public/audio/tts-cache");
export const CACHE_URL_PREFIX = "/audio/tts-cache";

// edge-tts passes the whole string as a single argv entry, so unbounded text hits the
// OS argv limit (spawn E2BIG) -- the same failure lib/tts/text-parser.ts guards against
// for book narration. Rather than rejecting long text (which used to 400 and leave the
// player silently waiting out its 30s fallback timer), split on sentence boundaries and
// stitch the pieces back into one file.
const CHUNK_CHARS = 1500;
// A real guard, not a formatting limit: nothing in a lesson screen or story page should
// approach this, and a request this large is a bug or an abuse, not narration.
export const MAX_TEXT_CHARS = 8000;

export function cacheKey(text: string, voice: string): string {
  return createHash("sha256").update(`${voice}::${text}`).digest("hex");
}

export interface CacheEntry {
  key: string;
  filePath: string;
  url: string;
}

export function resolveEntry(text: string, voice: string = DEFAULT_NARRATOR_VOICE): CacheEntry {
  const key = cacheKey(text, voice);
  const filename = `${key}.mp3`;
  return {
    key,
    filePath: path.join(CACHE_DIR, filename),
    url: `${CACHE_URL_PREFIX}/${filename}`,
  };
}

export async function isCached(entry: CacheEntry): Promise<boolean> {
  try {
    await fs.access(entry.filePath);
    return true;
  } catch {
    return false;
  }
}

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_CHARS) return [text];
  // Sentence-boundary split so a chunk seam never lands mid-word, which would make
  // the stitched audio audibly wrong rather than just paused.
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > CHUNK_CHARS) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence;
    // A single sentence longer than the chunk limit still has to be broken somewhere.
    while (current.length > CHUNK_CHARS) {
      chunks.push(current.slice(0, CHUNK_CHARS).trim());
      current = current.slice(CHUNK_CHARS);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

// Deduplicates concurrent requests for the same key. Without this, the player's own
// two effects (current screen + next-screen prefetch) plus any second reader could all
// miss the cache at once and spawn several edge-tts processes writing the SAME path
// simultaneously -- producing an interleaved, truncated MP3 that then gets served
// forever as a valid cache entry.
const inFlight = new Map<string, Promise<void>>();

async function writeAudio(text: string, voice: string, filePath: string): Promise<void> {
  const chunks = splitIntoChunks(text);

  // Write to a sibling .part file and rename only on success. rename() is atomic within
  // a filesystem, so a reader can never observe (and permanently cache) a half-written
  // file, and a crashed synthesis leaves no poisoned entry behind.
  const partPath = `${filePath}.part`;
  await fs.mkdir(CACHE_DIR, { recursive: true });

  try {
    if (chunks.length === 1) {
      await generateSpeech(text, voice, partPath);
    } else {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-tts-chunk-"));
      const segments: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const segPath = path.join(tmpDir, `chunk_${i}.mp3`);
        await generateSpeech(chunks[i], voice, segPath);
        segments.push(segPath);
      }
      // stitchToMp3 removes each segment's parent directory when it's done.
      await stitchToMp3(segments, partPath);
    }
    await fs.rename(partPath, filePath);
  } catch (err) {
    await fs.rm(partPath, { force: true }).catch(() => {});
    throw err;
  }
}

// Returns the served URL, synthesizing only if the file isn't already on disk.
export async function ensureAudio(
  text: string,
  voice: string = DEFAULT_NARRATOR_VOICE
): Promise<string> {
  const entry = resolveEntry(text, voice);
  if (await isCached(entry)) return entry.url;

  const existing = inFlight.get(entry.key);
  if (existing) {
    await existing;
    return entry.url;
  }

  const job = writeAudio(text, voice, entry.filePath).finally(() => {
    inFlight.delete(entry.key);
  });
  inFlight.set(entry.key, job);
  await job;
  return entry.url;
}

// Bounded-concurrency map, used to warm many clips without spawning one edge-tts per
// text at once. edge-tts is network-bound (it opens a WebSocket to Microsoft; there is
// no local model), so a small amount of parallelism is a real speedup -- but the box
// also runs six other PM2 apps, so it stays small.
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
