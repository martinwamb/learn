import { NextResponse } from "next/server";
import { DEFAULT_NARRATOR_VOICE } from "@/lib/tts/edge-tts";
import {
  ensureAudio,
  isCached,
  mapWithConcurrency,
  resolveEntry,
  MAX_TEXT_CHARS,
} from "@/lib/tts/cache";

// Batch narration prep: the player calls this ONCE when a lesson or story mounts, with
// every line it could need, and gets back a URL per line. This replaces the old
// per-screen fetch-on-entry, which paid an edge-tts spawn (~1s, measured on the server)
// plus a second round trip for the MP3 at the exact moment a child was waiting to read.
//
// Warm entries resolve from disk with no synthesis at all -- workers/tts-warm.ts
// pre-generates published content overnight, so in steady state this is a pure lookup.

const MAX_TEXTS = 80;
// edge-tts is network-bound (a WebSocket to Microsoft, no local model), so a few in
// parallel is a genuine speedup -- but this box also runs six other PM2 apps, so this
// stays deliberately small.
const CONCURRENCY = 3;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { texts, voice: rawVoice } = (body ?? {}) as { texts?: unknown; voice?: unknown };
  const voice = typeof rawVoice === "string" && rawVoice.trim() ? rawVoice.trim() : DEFAULT_NARRATOR_VOICE;

  if (!Array.isArray(texts)) {
    return NextResponse.json({ error: "texts must be an array" }, { status: 400 });
  }

  const cleaned = texts
    .slice(0, MAX_TEXTS)
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .map((t) => (t && t.length <= MAX_TEXT_CHARS ? t : ""));

  // Resolve the already-cached ones first and only synthesize the rest, so a warm
  // lesson returns immediately instead of waiting behind a concurrency queue.
  const urls: (string | null)[] = new Array(cleaned.length).fill(null);
  const misses: number[] = [];

  await Promise.all(
    cleaned.map(async (text, i) => {
      if (!text) return;
      const entry = resolveEntry(text, voice);
      if (await isCached(entry)) urls[i] = entry.url;
      else misses.push(i);
    })
  );

  // One failed clip must not fail the batch -- the player falls back to its timer for
  // any null URL, which is a silent screen rather than a broken lesson.
  await mapWithConcurrency(misses, CONCURRENCY, async (i) => {
    try {
      urls[i] = await ensureAudio(cleaned[i], voice);
    } catch (err) {
      console.error("TTS prepare error:", err);
      urls[i] = null;
    }
  });

  return NextResponse.json({ urls, prepared: misses.length });
}
