// Shape and reading-level guards for generated Jina stories.
//
// Mirrors lib/lesson-validation.ts's contract (null means valid, a string is the
// human-readable reason to skip). The difference is that a story has a hard pedagogical
// constraint a lesson does not: it is written for a specific reading level, and a story
// that overshoots that level is worse than no story at all -- a PP1 child handed
// 14-word sentences simply stops reading. So this validator checks length as strictly
// as it checks shape.

import { validateLessonShape } from "./lesson-validation";
import { PAGE_COUNT_TOLERANCE, READING_LEVELS, type ReadingLevel } from "./story/reading-levels";

export interface StoryShape {
  pages: unknown;
  activities: unknown;
  vocabulary?: unknown;
}

// Words per sentence, counted the way a teacher would: split on whitespace.
function wordCount(sentence: string): number {
  return sentence.trim().split(/\s+/).filter(Boolean).length;
}

function sentencesIn(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]*/g) ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
}

export function validateStoryShape(story: StoryShape, level: ReadingLevel): string | null {
  const rule = READING_LEVELS[level];

  if (!Array.isArray(story.pages)) return "pages is not an array";
  if (!story.pages.length) return "story has no pages";

  const min = rule.pages - PAGE_COUNT_TOLERANCE;
  const max = rule.pages + PAGE_COUNT_TOLERANCE;
  if (story.pages.length < min || story.pages.length > max) {
    return `${level} stories need ${min}-${max} pages, got ${story.pages.length}`;
  }

  for (const [i, page] of (story.pages as Record<string, unknown>[]).entries()) {
    if (!page || typeof page !== "object") return `page ${i + 1} is not an object`;
    if (typeof page.text !== "string" || !page.text.trim()) return `page ${i + 1} has no text`;
    if (typeof page.imageQuery !== "string" || !page.imageQuery.trim()) {
      return `page ${i + 1} has no imageQuery`;
    }

    // A 20% overshoot allowance: models cannot count words reliably, and rejecting a
    // whole 4-minute generation because one PP1 sentence has 7 words instead of 6
    // burns the nightly budget for no real benefit to the child. Anything beyond that
    // is a genuinely wrong-level story.
    const allowed = Math.ceil(rule.maxWordsPerSentence * 1.2);
    for (const sentence of sentencesIn(page.text)) {
      const words = wordCount(sentence);
      if (words > allowed) {
        return `page ${i + 1} has a ${words}-word sentence; ${level} allows about ${rule.maxWordsPerSentence}`;
      }
    }
  }

  if (story.vocabulary !== undefined) {
    if (!Array.isArray(story.vocabulary) || story.vocabulary.some((v) => typeof v !== "string")) {
      return "vocabulary must be a flat array of strings";
    }
  }

  // Activities are the same shape as a lesson's and go through the same player, so
  // reuse the existing check rather than duplicating its rules.
  return validateLessonShape({ content: [], activities: story.activities as unknown[] });
}
