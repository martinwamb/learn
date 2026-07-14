/**
 * Story Importer Worker — runs nightly at 01:15 UTC via PM2 cron (off-peak, clear of
 * port's 02:00 KB sync and publisher-site's 02:30/03:00 jobs, and learn's own
 * tts-worker at 23:15 / lesson-generator at 04:30).
 *
 * Closes the gap where books only ever entered the library via a manual user
 * search-and-save flow -- reuses the exact same search functions and save logic as
 * that flow (lib/books/*, lib/books/save.ts), just triggered automatically. Saves
 * with audioStatus "pending" + fetched text, so the existing nightly TTS worker
 * (workers/tts-worker.ts) picks new books up on its own the following night --
 * no changes needed there.
 *
 * PM2: pm2 start workers/story-importer.js --name learn-story-worker --cron "15 1 * * *"
 */
import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { saveBook, fetchStoryText, type SaveBookInput } from "../lib/books/save";
import { searchOpenLibrary } from "../lib/books/open-library";
import { searchGutenberg } from "../lib/books/gutenberg";
import { searchAfricanStorybook } from "../lib/books/african-storybook";
import { searchStoryweaver } from "../lib/books/storyweaver";

const db = createScriptDb();
const MAX_PER_RUN = Number(process.env.STORY_IMPORT_MAX_PER_RUN ?? 5);

// Rotates through one term per night (deterministic by day-of-year) rather than
// hammering every source with every term every run -- keeps nightly load flat and
// spreads variety across the library over time, same philosophy as the lesson
// generator's MAX_TOTAL_PER_RUN throttle.
const QUERY_TERMS = [
  "African folktales",
  "Kenyan children stories",
  "animal stories for children",
  "bedtime stories for kids",
  "adventure stories for children",
  "fairy tales for children",
  "moral stories for kids",
  "friendship stories for children",
];

function todaysQuery(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  return QUERY_TERMS[dayOfYear % QUERY_TERMS.length];
}

async function searchAllSources(query: string): Promise<SaveBookInput[]> {
  const [ol, gb, asb, sw] = await Promise.all([
    searchOpenLibrary(query, 1).catch(() => []),
    searchGutenberg(query, 1).catch(() => []),
    searchAfricanStorybook(query).catch(() => []),
    searchStoryweaver(query, "English", 1).catch(() => []),
  ]);

  // Order matters: African Storybook and Storyweaver reliably have real page text,
  // Gutenberg has real (if denser) plaintext, but Open Library's "text" is just its
  // sparse `description` blurb -- with a low per-run cap, whichever source comes
  // first tends to fill the whole run, so put the sources that actually produce
  // narratable text ahead of the one that usually won't.
  return [
    ...asb.map((b) => ({ externalId: b.id, source: "african-storybook", title: b.title, author: b.author, coverUrl: b.cover_image ?? null })),
    ...sw.map((b) => ({ externalId: String(b.id), source: "storyweaver", title: b.title, author: b.author, coverUrl: b.cover_image })),
    ...gb.map((b) => ({ externalId: String(b.id), source: "gutenberg", title: b.title, author: b.authors[0]?.name, coverUrl: b.formats["image/jpeg"] ?? null })),
    ...ol.map((b) => ({ externalId: b.key, source: "open-library", title: b.title, author: b.author_name?.[0], coverUrl: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null })),
  ];
}

async function run() {
  const start = Date.now();
  const query = todaysQuery();
  console.log(`\n📖 Story Importer started at ${new Date().toISOString()} — query: "${query}"`);

  const candidates = await searchAllSources(query);
  console.log(`Found ${candidates.length} candidates across all sources`);

  let imported = 0;
  const errors: string[] = [];

  for (const candidate of candidates) {
    if (imported >= MAX_PER_RUN) {
      console.log(`  ⏸️  Reached STORY_IMPORT_MAX_PER_RUN (${MAX_PER_RUN}) — remaining candidates continue next run`);
      break;
    }

    // Skip a book we already have real text for -- no need to re-fetch or re-save.
    const existing = await db.book.findUnique({
      where: { source_externalId: { source: candidate.source, externalId: candidate.externalId } },
      select: { id: true, text: true },
    });
    if (existing?.text) continue;

    try {
      // Fetch text FIRST and skip entirely if there isn't any -- the whole point of
      // this pipeline is books the TTS worker can actually narrate (which requires
      // non-null text); importing one that can never get audio is dead weight in
      // the library.
      const text = await fetchStoryText(candidate);
      if (!text) {
        console.log(`  · Skipped "${candidate.title}" [${candidate.source}] — no narratable text available`);
        continue;
      }
      await saveBook(db, candidate, text);
      imported++;
      console.log(`  ✓ "${candidate.title}" [${candidate.source}]`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ "${candidate.title}": ${msg}`);
      errors.push(`${candidate.title}: ${msg}`);
    }
  }

  const durationMs = Date.now() - start;
  await db.generatorLog.create({
    data: {
      workerType: "story",
      booksProcessed: imported,
      errors,
      durationMs,
    },
  });

  console.log(`\n✅ Story Importer done — ${imported} new books, ${(durationMs / 1000).toFixed(1)}s`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Story Importer fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
