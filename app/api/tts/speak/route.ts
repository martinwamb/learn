import { NextResponse } from "next/server";
import { DEFAULT_NARRATOR_VOICE } from "@/lib/tts/edge-tts";
import { ensureAudio, isCached, resolveEntry, MAX_TEXT_CHARS } from "@/lib/tts/cache";

// Single-clip narration. The player now batch-prepares a whole lesson's audio up front
// via /api/tts/prepare, so this route is the fallback path for text that isn't known
// ahead of time -- chiefly the completion screen, whose narration embeds the final
// score. Cache semantics, in-flight dedupe and atomic writes all live in lib/tts/cache.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim() ?? "";
  const voice = searchParams.get("voice")?.trim() || DEFAULT_NARRATOR_VOICE;

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_CHARS) {
    return NextResponse.json({ error: "text too long" }, { status: 400 });
  }

  const entry = resolveEntry(text, voice);
  if (await isCached(entry)) {
    return NextResponse.json({ url: entry.url, cached: true });
  }

  try {
    const url = await ensureAudio(text, voice);
    return NextResponse.json({ url, cached: false });
  } catch (err) {
    console.error("TTS speak error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
  }
}
