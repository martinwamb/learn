import type { Activity } from "../../lib/lesson/screens";
import type { GameSpec } from "../../lib/games/types";
import type { ReadingLevel } from "../../lib/story/reading-levels";

// Hand-authored Jina stories, committed to git and upserted by prisma/seed-stories.ts
// on every deploy -- the same delivery path prisma/seed.ts uses for the curriculum.
//
// These 27 stories (one per existing unit) are also the style exemplars fed to
// workers/story-generator.ts: the prompt includes the unit's authored story verbatim so
// the model has a concrete target for voice, length and vocabulary rather than only a
// description of one.

export interface SeedStory {
  title: string;
  /** The reading skill the story reinforces -- shown on the welcome screen. */
  objective: string;
  readingLevel: ReadingLevel;
  /** Length and sentence complexity must match READING_LEVELS[readingLevel]. */
  pages: { text: string; imageQuery: string }[];
  /** Target words this story drills; also feeds the Word Builder game. */
  vocabulary: string[];
  activities: Activity[];
  games?: GameSpec[];
  funFact?: string;
}

/** Keyed "{GRADE_CODE}-{subjectSlug}-{unitSequence}". */
export type StoryMap = Record<string, SeedStory>;
