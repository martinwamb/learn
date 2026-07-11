import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { searchSound } from "@/lib/media/freesound";
import { isQuerySafe } from "@/lib/media/query";

const CACHE_DIR = path.resolve(/* turbopackIgnore: true */ "./public/media/sounds");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim().toLowerCase() ?? "";

  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });
  if (query.length > 100) return NextResponse.json({ error: "query too long" }, { status: 400 });
  if (!isQuerySafe(query)) return NextResponse.json({ error: "query rejected" }, { status: 400 });

  const key = createHash("sha256").update(query).digest("hex");
  const filename = `${key}.mp3`;
  const filePath = path.join(CACHE_DIR, filename);
  const url = `/media/sounds/${filename}`;

  try {
    await fs.access(filePath);
    return NextResponse.json({ url, cached: true });
  } catch {
    // cache miss, fall through
  }

  try {
    const soundUrl = await searchSound(query);
    if (!soundUrl) return NextResponse.json({ error: "No sound found" }, { status: 404 });

    const soundRes = await fetch(soundUrl);
    if (!soundRes.ok) throw new Error(`Freesound preview fetch HTTP ${soundRes.status}`);
    const buffer = Buffer.from(await soundRes.arrayBuffer());

    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url, cached: false });
  } catch (err) {
    console.error("Media sound error:", err);
    return NextResponse.json({ error: "Sound lookup failed" }, { status: 502 });
  }
}
