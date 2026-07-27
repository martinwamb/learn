// The single source of truth for how long and how hard a Jina story may be at each
// grade. Consumed by the hand-authored seed content (prisma/story-content/*), by the
// generator prompt (workers/story-generator.ts) and by the validator that rejects
// drafts the model wrote too long (lib/story-validation.ts) -- so a story that passes
// review is guaranteed to be readable by the child it's shown to.

export type ReadingLevel = "PP1" | "PP2" | "G1" | "G2" | "G3";

export interface ReadingLevelRule {
  level: ReadingLevel;
  label: string;
  ageRange: string;
  pages: number;
  sentencesPerPage: string;
  maxWordsPerSentence: number;
  vocabulary: string;
  /** Roughly how long a child takes to read it -- used for Story.duration. */
  durationMinutes: number;
}

export const READING_LEVELS: Record<ReadingLevel, ReadingLevelRule> = {
  PP1: {
    level: "PP1",
    label: "First Words",
    ageRange: "4-5",
    pages: 6,
    sentencesPerPage: "exactly 1 sentence",
    maxWordsPerSentence: 6,
    vocabulary:
      "CVC words (cat, sun, big) and the most common sight words (the, a, is, and, to, she, he, we, my, look, see, go). No consonant blends, no words over two syllables except the name Jina.",
    durationMinutes: 5,
  },
  PP2: {
    level: "PP2",
    label: "Building Words",
    ageRange: "5-6",
    pages: 8,
    sentencesPerPage: "1 to 2 short sentences",
    maxWordsPerSentence: 8,
    vocabulary:
      "CVC words plus simple digraphs (sh, ch, th, ck) and common sight words. Simple plurals with -s are fine. Avoid consonant blends longer than two letters.",
    durationMinutes: 6,
  },
  G1: {
    level: "G1",
    label: "Reading On",
    ageRange: "6-7",
    pages: 10,
    sentencesPerPage: "2 sentences",
    maxWordsPerSentence: 10,
    vocabulary:
      "Blends (st, tr, bl, gr), digraphs, common plurals, and simple -ing/-ed endings. One or two everyday Kenyan words (matatu, ugali, shamba) are welcome if the meaning is clear from the picture.",
    durationMinutes: 8,
  },
  G2: {
    level: "G2",
    label: "Story Reader",
    ageRange: "7-8",
    pages: 12,
    sentencesPerPage: "3 to 4 sentences",
    maxWordsPerSentence: 14,
    vocabulary:
      "Past tense, compound words, contractions, and simple dialogue. Descriptive adjectives are encouraged.",
    durationMinutes: 10,
  },
  G3: {
    level: "G3",
    label: "Confident Reader",
    ageRange: "8-9",
    pages: 14,
    sentencesPerPage: "4 to 5 sentences",
    maxWordsPerSentence: 18,
    vocabulary:
      "Dialogue with speech marks, multi-clause sentences joined with because/although/while, and richer descriptive language.",
    durationMinutes: 12,
  },
};

export const READING_LEVEL_ORDER: ReadingLevel[] = ["PP1", "PP2", "G1", "G2", "G3"];

export function isReadingLevel(code: string): code is ReadingLevel {
  return (READING_LEVEL_ORDER as string[]).includes(code);
}

// Grade codes and reading levels are 1:1 today, but they're separate concepts -- a
// story is written AT a level, and only happens to be shown to the grade that matches.
export function levelForGradeCode(gradeCode: string): ReadingLevel {
  const upper = gradeCode.toUpperCase();
  return isReadingLevel(upper) ? upper : "G1";
}

// Page-count tolerance for generated stories: the rule is the target, but rejecting a
// perfectly good 9-page G1 story for being one page short would waste a 4-minute
// generation run for no pedagogical gain.
export const PAGE_COUNT_TOLERANCE = 2;
