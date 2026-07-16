/**
 * Illustration Generator Worker — runs nightly via PM2 cron. Splits each book's text
 * into a capped number of "pages", asks Ollama for a short image-search label per
 * page in one batched call, and stores {text, imageQuery} pairs on Book.pages. The
 * actual illustration lookup happens later, at render time, via the same
 * Iconscout-backed /api/media/image route lesson picture-match items already use
 * (lib/media/iconscout.ts) -- this worker never calls Iconscout itself, it only
 * picks the search label.
 *
 * PM2: pm2 start workers/illustration-generator.js --name learn-illustration-worker --cron "15 2 * * *"
 */
import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { callOllama, extractJson } from "../lib/ollama";

const db = createScriptDb();
const MAX_PER_RUN = Number(process.env.ILLUSTRATION_MAX_PER_RUN ?? 5);
// Gutenberg books can be full novels (100K-580K chars) -- capping pages keeps this an
// "illustrated highlights" pass, not a page-for-page novel adaptation, and keeps the
// single Ollama call's prompt a sane size.
const MAX_PAGES_PER_BOOK = Number(process.env.ILLUSTRATION_MAX_PAGES_PER_BOOK ?? 15);
const PAGE_TARGET_CHARS = 1800;
const EXCERPT_CHARS = 150;

interface BookPage {
  text: string;
  imageQuery: string;
}

interface IllustrationLabel {
  pageIndex: number;
  imageQuery: string;
}

function chunkIntoPages(text: string): string[] {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const pages: string[] = [];
  let current = "";
  for (const line of lines) {
    if (pages.length >= MAX_PAGES_PER_BOOK) break;
    if (current && current.length + line.length + 1 > PAGE_TARGET_CHARS) {
      pages.push(current);
      current = line;
    } else {
      current = current ? `${current} ${line}` : line;
    }
  }
  if (current && pages.length < MAX_PAGES_PER_BOOK) pages.push(current);
  return pages;
}

function buildPrompt(title: string, pageTexts: string[]): string {
  const excerpts = pageTexts.map((p, i) => `Page ${i}: ${p.slice(0, EXCERPT_CHARS)}`).join("\n");
  return `You are choosing a short image search phrase for each page of a children's story titled "${title}", so an app can find a matching stock photo for each page.

Here are excerpts from ${pageTexts.length} pages, in order:
${excerpts}

For each page, respond with a short (2-4 word) concrete, visual search phrase describing
what a picture for that page should show (e.g. "girl reading book", "forest with trees",
"rabbit running"). Avoid character names -- a stock photo site won't know them, so
describe the scene/subject generically instead.

Respond with ONLY a valid JSON array, no other text, in this exact shape:
[{"pageIndex": 0, "imageQuery": "..."}, {"pageIndex": 1, "imageQuery": "..."}]`;
}

async function illustrateBook(bookId: string): Promise<boolean> {
  const book = await db.book.findUnique({ where: { id: bookId } });
  if (!book || !book.text) return false;

  const pageTexts = chunkIntoPages(book.text);
  if (pageTexts.length === 0) return false;

  const prompt = buildPrompt(book.title, pageTexts);

  let labels: IllustrationLabel[] | null = null;
  try {
    const raw = await callOllama(prompt, 400);
    const parsed = extractJson<IllustrationLabel[]>(raw);
    labels = Array.isArray(parsed) ? parsed : null;
    if (!labels) {
      const raw2 = await callOllama(prompt + "\n\nRemember: respond with ONLY the JSON array, no other text.", 400);
      const retry = extractJson<IllustrationLabel[]>(raw2);
      labels = Array.isArray(retry) ? retry : null;
    }
  } catch (err) {
    console.error(`  ❌ Ollama error for "${book.title}": ${err}`);
    return false;
  }

  if (!labels) {
    console.warn(`  ⚠️  Malformed illustration response for "${book.title}", skipping`);
    return false;
  }

  const pages: BookPage[] = pageTexts.map((text, i) => {
    const label = labels!.find((l) => l && l.pageIndex === i);
    const imageQuery = label && typeof label.imageQuery === "string" ? label.imageQuery : book.title;
    return { text, imageQuery };
  });

  await db.book.update({ where: { id: bookId }, data: { pages: pages as never } });
  console.log(`  ✓ "${book.title}" — ${pages.length} pages illustrated`);
  return true;
}

async function run() {
  const start = Date.now();
  console.log(`\n🎨 Illustration Generator started at ${new Date().toISOString()}`);

  // Nullable Json fields can't be filtered by `pages: null` directly in Prisma
  // (ambiguous between DB NULL and a JSON null value) -- fetch text-bearing
  // candidates and filter for an unset `pages` in JS instead.
  const candidates = await db.book.findMany({
    where: { text: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true, pages: true },
  });
  const pending = candidates.filter((b) => !b.pages).slice(0, MAX_PER_RUN);

  console.log(`Found ${pending.length} books needing illustrations`);
  let processed = 0;
  const errors: string[] = [];

  for (const book of pending) {
    try {
      const ok = await illustrateBook(book.id);
      if (ok) processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Book ${book.id}: ${msg}`);
      errors.push(`${book.id}: ${msg}`);
    }
  }

  const durationMs = Date.now() - start;
  await db.generatorLog.create({
    data: {
      workerType: "illustration",
      booksProcessed: processed,
      errors,
      durationMs,
    },
  });

  console.log(`\n✅ Illustration Generator done — ${processed}/${pending.length} books, ${(durationMs / 1000).toFixed(1)}s`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Illustration Generator fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
