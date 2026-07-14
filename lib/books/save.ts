import type { PrismaClient } from "@/lib/generated/prisma/client";
import { getOpenLibraryText } from "./open-library";
import { getGutenbergTextById } from "./gutenberg";
import { getAfricanStorybookText } from "./african-storybook";
import { getStoryweaverText } from "./storyweaver";

export interface SaveBookInput {
  externalId: string;
  source: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
}

// Best-effort full-text fetch for TTS narration -- workers/tts-worker.ts only picks
// up books where `text` is non-null, so saving without this means audioStatus stays
// "pending" forever with nothing for the nightly narration worker to actually
// narrate (a real gap found in the original manual save flow, which never fetched
// text at all). A failure here doesn't block saving the book -- text stays null and
// a future save (the importer worker resurfacing the same book, or a retry) can
// backfill it.
async function fetchStoryText(input: SaveBookInput): Promise<string | null> {
  try {
    switch (input.source) {
      case "open-library":
        return await getOpenLibraryText(input.externalId);
      case "gutenberg":
        return await getGutenbergTextById(input.externalId);
      case "african-storybook":
        return await getAfricanStorybookText(input.externalId);
      case "storyweaver":
        return await getStoryweaverText(Number(input.externalId));
      default:
        return null;
    }
  } catch {
    return null;
  }
}

// Shared by both the manual save API route (app/api/books/save/route.ts) and the
// automated nightly importer (workers/story-importer.ts) so there's exactly one
// place the upsert-plus-text-fetch logic lives.
export async function saveBook(db: PrismaClient, input: SaveBookInput) {
  const text = await fetchStoryText(input);

  return db.book.upsert({
    where: { source_externalId: { source: input.source, externalId: input.externalId } },
    // Only touch `text` if we actually got some -- backfills a previously-missing
    // value without needing to re-fetch/overwrite an already-populated one.
    update: text ? { text } : {},
    create: {
      externalId: input.externalId,
      source: input.source,
      title: input.title,
      author: input.author ?? undefined,
      coverUrl: input.coverUrl ?? undefined,
      text: text ?? undefined,
      audioStatus: "pending",
    },
  });
}
