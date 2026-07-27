/**
 * Validates every hand-authored Jina story against the reading-level rules it claims.
 *
 * Hand-authored content is the one thing no runtime guard catches: the generator's
 * output goes through lib/story-validation.ts before it is ever saved, but seed content
 * is written straight into the database by prisma/seed-stories.ts. A PP1 story that
 * quietly grew a 12-word sentence would ship to four-year-olds unchallenged.
 *
 * Run: npx tsx scripts/check-story-content.ts
 */

import { validateStoryShape } from "../lib/story-validation";
import { READING_LEVELS } from "../lib/story/reading-levels";
import { parseGames } from "../lib/games/validation";
import type { StoryMap } from "../prisma/story-content/types";
import { pp1Stories } from "../prisma/story-content/pp1";
import { pp2Stories } from "../prisma/story-content/pp2";
import { g1Stories } from "../prisma/story-content/g1";
import { g2Stories } from "../prisma/story-content/g2";
import { g3Stories } from "../prisma/story-content/g3";

const maps: [string, StoryMap][] = [
  ["pp1", pp1Stories],
  ["pp2", pp2Stories],
  ["g1", g1Stories],
  ["g2", g2Stories],
  ["g3", g3Stories],
];

let failures = 0;
let total = 0;

for (const [file, map] of maps) {
  for (const [key, story] of Object.entries(map)) {
    total++;
    const rule = READING_LEVELS[story.readingLevel];
    const problems: string[] = [];

    const shapeError = validateStoryShape(
      { pages: story.pages, activities: story.activities, vocabulary: story.vocabulary },
      story.readingLevel
    );
    if (shapeError) problems.push(shapeError);

    // The seed content is held to the exact page count, not the generator's tolerance --
    // there is no excuse for a hand-written story being off-spec.
    if (story.pages.length !== rule.pages) {
      problems.push(`expected exactly ${rule.pages} pages, got ${story.pages.length}`);
    }

    if (!story.vocabulary.length) problems.push("no vocabulary words");
    if (!story.activities.length) problems.push("no comprehension activities");

    // Pre-readers cannot type or operate a text input.
    if (story.readingLevel === "PP1" || story.readingLevel === "PP2") {
      const wrong = story.activities.filter((a) => a.type !== "multiple_choice");
      if (wrong.length) {
        problems.push(`${story.readingLevel} allows multiple_choice only, found: ${wrong.map((a) => a.type).join(", ")}`);
      }
    }

    // Every multiple-choice answer must actually be one of the options, or the question
    // is unanswerable -- the single most damaging content bug possible here.
    for (const [i, act] of story.activities.entries()) {
      if (act.type === "multiple_choice") {
        if (!act.options?.length) problems.push(`activity ${i + 1} has no options`);
        else if (!act.options.includes(act.answer ?? "")) {
          problems.push(`activity ${i + 1}: answer "${act.answer}" is not among its options`);
        }
      }
      if (act.type === "fill_blank") {
        if (!act.sentence?.includes("___")) problems.push(`activity ${i + 1}: fill_blank sentence has no ___ blank`);
        if (!act.answer) problems.push(`activity ${i + 1}: fill_blank has no answer`);
      }
    }

    if (story.games) {
      const parsed = parseGames(story.games);
      if (parsed.length !== story.games.length) {
        problems.push(`${story.games.length - parsed.length} game(s) failed validation and would be dropped`);
      }
    }

    if (problems.length) {
      failures++;
      console.error(`\n✗ ${file}: ${key} — "${story.title}"`);
      for (const p of problems) console.error(`    ${p}`);
    }
  }
}

console.log(`\n${total - failures}/${total} stories valid.`);
if (failures) {
  console.error(`${failures} story(ies) need fixing.`);
  process.exit(1);
}
