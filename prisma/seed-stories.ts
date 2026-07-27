import type { PrismaClient } from "../lib/generated/prisma/client";
import { READING_LEVELS, levelForGradeCode } from "../lib/story/reading-levels";
import type { SeedStory, StoryMap } from "./story-content/types";
import { pp1Stories } from "./story-content/pp1";
import { pp2Stories } from "./story-content/pp2";
import { g1Stories } from "./story-content/g1";
import { g2Stories } from "./story-content/g2";
import { g3Stories } from "./story-content/g3";

// One hand-written Jina story per existing CBC unit, upserted on every deploy.
//
// Deliberately follows prisma/seed.ts's rules rather than inventing new ones:
//   - keyed on unitId + sequence, and these authored stories always take sequence 1,
//     so AI-generated stories (which get sequence 2 and up) can never be clobbered;
//   - the upsert genuinely updates its fields rather than using `update: {}`, so a
//     wording fix in a story-content file actually reaches production. See the note at
//     the top of seed.ts's main() for the bug that rule exists to prevent.

const storyMaps: StoryMap[] = [pp1Stories, pp2Stories, g1Stories, g2Stories, g3Stories];

const allStories: StoryMap = Object.assign({}, ...storyMaps);

// The authored story for a unit is always sequence 1 -- it is the one the generator
// prompt uses as a style exemplar, so it must be findable at a fixed position.
export const AUTHORED_STORY_SEQUENCE = 1;

export async function seedStories(db: PrismaClient) {
  console.log("📖 Seeding Jina stories...");

  let written = 0;
  const missingUnits: string[] = [];

  for (const [key, story] of Object.entries(allStories)) {
    // Key format: "{GRADE}-{subjectSlug}-{unitSequence}". The grade code is the first
    // segment and the unit sequence the last; the subject slug is everything between,
    // because slugs themselves contain hyphens ("religious-education", "creative-arts").
    const parts = key.split("-");
    const gradeCode = parts[0];
    const unitSequence = Number(parts[parts.length - 1]);
    const subjectSlug = parts.slice(1, -1).join("-");

    const grade = await db.grade.findUnique({ where: { code: gradeCode } });
    if (!grade) {
      missingUnits.push(`${key} (no grade ${gradeCode})`);
      continue;
    }

    const subject = await db.subject.findUnique({
      where: { gradeId_slug: { gradeId: grade.id, slug: subjectSlug } },
    });
    if (!subject) {
      missingUnits.push(`${key} (no subject ${subjectSlug})`);
      continue;
    }

    const unit = await db.unit.findUnique({
      where: { subjectId_sequence: { subjectId: subject.id, sequence: unitSequence } },
    });
    if (!unit) {
      missingUnits.push(`${key} (no unit ${unitSequence})`);
      continue;
    }

    const level = story.readingLevel ?? levelForGradeCode(gradeCode);
    const data = {
      title: story.title,
      objective: story.objective,
      readingLevel: level,
      pages: story.pages as never,
      vocabulary: story.vocabulary,
      activities: story.activities as never,
      games: (story.games ?? null) as never,
      funFact: story.funFact ?? null,
      duration: READING_LEVELS[level].durationMinutes,
      source: "seed",
      status: "published",
    };

    await db.story.upsert({
      where: { unitId_sequence: { unitId: unit.id, sequence: AUTHORED_STORY_SEQUENCE } },
      update: data,
      create: { unitId: unit.id, sequence: AUTHORED_STORY_SEQUENCE, ...data },
    });
    written++;
  }

  console.log(`  ✓ ${written} stories seeded`);
  // Loud but non-fatal: a unit can legitimately disappear between deploys, and a
  // missing story should never take the whole seed (and therefore the deploy) down.
  if (missingUnits.length) {
    console.warn(`  ⚠️  ${missingUnits.length} story(ies) had no matching unit: ${missingUnits.join(", ")}`);
  }
}

// Exported for the generator worker, which feeds a unit's authored story to the model
// as a concrete style exemplar.
export function authoredStoryForUnit(
  gradeCode: string,
  subjectSlug: string,
  unitSequence: number
): SeedStory | undefined {
  return allStories[`${gradeCode}-${subjectSlug}-${unitSequence}`];
}
