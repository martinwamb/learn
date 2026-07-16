import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { searchIllustration } from "@/lib/media/iconscout";
import { isQuerySafe } from "@/lib/media/query";

const CACHE_DIR = path.resolve(/* turbopackIgnore: true */ "./public/media/images");

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim().toLowerCase() ?? "";

  if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });
  if (query.length > 100) return NextResponse.json({ error: "query too long" }, { status: 400 });
  if (!isQuerySafe(query)) return NextResponse.json({ error: "query rejected" }, { status: 400 });

  const key = createHash("sha256").update(query).digest("hex");
  const filename = `${key}.png`;
  const filePath = path.join(CACHE_DIR, filename);
  const url = `/media/images/${filename}`;

  try {
    await fs.access(filePath);
    return NextResponse.json({ url, cached: true });
  } catch {
    // cache miss, fall through
  }

  try {
    const illustrationUrl = await searchIllustration(query);
    if (!illustrationUrl) return NextResponse.json({ error: "No illustration found" }, { status: 404 });

    const imgRes = await fetch(illustrationUrl);
    if (!imgRes.ok) throw new Error(`Iconscout image fetch HTTP ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ url, cached: false });
  } catch (err) {
    console.error("Media image error:", err);
    return NextResponse.json({ error: "Image lookup failed" }, { status: 502 });
  }
}
