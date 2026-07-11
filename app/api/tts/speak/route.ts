import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { generateSpeech, DEFAULT_NARRATOR_VOICE } from "@/lib/tts/edge-tts";

// Content-addressed cache: identical (text, voice) pairs -- e.g. the fixed
// CORRECT_PHRASES/WRONG_PHRASES narration lines reused across every lesson -- are only
// ever synthesized once, not once per lesson play.
const CACHE_DIR = path.resolve(/* turbopackIgnore: true */ "./public/audio/tts-cache");

function cacheKey(text: string, voice: string): string {
  return createHash("sha256").update(`${voice}::${text}`).digest("hex");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim() ?? "";
  const voice = searchParams.get("voice")?.trim() || DEFAULT_NARRATOR_VOICE;

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  // Lesson narration lines are short; this also keeps the request/cache-file surface bounded.
  if (text.length > 2000) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const key = cacheKey(text, voice);
  const filename = `${key}.mp3`;
  const filePath = path.join(CACHE_DIR, filename);
  const url = `/audio/tts-cache/${filename}`;

  try {
    await fs.access(filePath);
    return NextResponse.json({ url, cached: true });
  } catch {
    // cache miss, fall through to generate
  }

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await generateSpeech(text, voice, filePath);
    return NextResponse.json({ url, cached: false });
  } catch (err) {
    console.error("TTS speak error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
  }
}
