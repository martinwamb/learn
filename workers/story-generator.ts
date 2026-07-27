/**
 * Jina Story Generator Worker — runs nightly at 05:35 UTC via PM2 cron, inside Ollama's
 * 22:00-06:00 UTC active window and after the faith worker (05:05) so the two heavy
 * Ollama callers never overlap.
 *
 * Every unit already has ONE hand-written story (prisma/story-content/*, seeded at
 * sequence 1). This worker tops each unit up to targetStoryCount with further stories at
 * sequence 2 and above. It never touches the authored story -- that one is the exemplar.
 *
 * Like workers/faith-lesson-generator.ts, and unlike the CBC lesson worker, the model is
 * NOT free to decide what the content is about: the unit title and its CBC outcomes are
 * fixed, the reading level dictates length and vocabulary, and the authored story is
 * handed over verbatim as a style target. A model shown a real example of "what a
 * 6-page PP1 story looks like" produces something usable far more often than one given
 * only a description of it.
 *
 * Generated stories save as status:"draft" and never reach a child until a human
 * publishes them at /admin/story-review.
 *
 * PM2: pm2 start "npm run worker:story-gen" --name learn-story-gen-worker --cron "35 5 * * *"
 */

import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { callOllama, extractJson } from "../lib/ollama";
import { validateStoryShape } from "../lib/story-validation";
import { validateGamesShape } from "../lib/games/validation";
import { READING_LEVELS, levelForGradeCode, type ReadingLevel } from "../lib/story/reading-levels";
import { authoredStoryForUnit } from "../prisma/seed-stories";

const db = createScriptDb();

// Deliberately smaller than the lesson budgets: a story is longer than a lesson, takes
// ~3-5 minutes each on this CPU-only box, and there is no point generating drafts
// faster than one admin can actually read them.
const MAX_TOTAL_PER_RUN = Number(process.env.STORY_GEN_MAX_TOTAL_PER_RUN ?? 3);

// Same reasoning as the faith worker's model choice: qwen2.5:3b reliably abandons a
// narrative before its turning point, producing well-formed but hollow stories. A story
// whose problem is never resolved is useless as reading practice, so this pays the
// thinking-model cost.
const STORY_OLLAMA_MODEL = process.env.STORY_OLLAMA_MODEL ?? "qwen3:14b";

interface GeneratedStory {
  title: string;
  objective: string;
  pages: unknown[];
  vocabulary?: unknown;
  activities: unknown[];
  games?: unknown;
  funFact?: string;
}

function buildStoryPrompt(
  gradeName: string,
  level: ReadingLevel,
  subjectName: string,
  unitTitle: string,
  outcomes: string[],
  exemplar: { title: string; pages: { text: string }[] } | null,
  existingTitles: string[],
  isKiswahili: boolean
): string {
  const rule = READING_LEVELS[level];

  const exemplarBlock = exemplar
    ? `\nHere is an existing story for this same unit. Match its voice, rhythm and sentence length exactly. Do NOT retell it -- write a DIFFERENT story about the same skill:\n\nTitle: ${exemplar.title}\n${exemplar.pages.map((p, i) => `Page ${i + 1}: ${p.text}`).join("\n")}\n`
    : "";

  const languageBlock = isKiswahili
    ? `\nCRITICAL: This unit is a Kiswahili unit. Write the ENTIRE story in Kiswahili -- the title, every page, the objective, the vocabulary, the questions and the answers. Do not write any English.\n`
    : "";

  const avoidBlock = existingTitles.length
    ? `\nStories that already exist for this unit (choose a different situation and a different title):\n${existingTitles.map((t) => `- ${t}`).join("\n")}\n`
    : "";

  return `You are writing an original story for Kenyan children in ${gradeName} (${subjectName}).

The story stars Jina, a young giraffe who lives in a Kenyan village, goes to school, and
has a family and friends. Jina is curious, kind, and sometimes gets things wrong before
she gets them right. Every story is set in a real, recognisable Kenya -- shambas, matatus,
markets, water taps, school compounds.

The story must teach and reinforce this unit's skill:
Unit: ${unitTitle}
Learning outcomes: ${outcomes.join("; ")}
${languageBlock}
READING LEVEL: ${level} (${rule.label}, ages ${rule.ageRange}). These limits are not
suggestions -- a child at this level cannot read a story that exceeds them:
- EXACTLY ${rule.pages} pages
- ${rule.sentencesPerPage} per page
- No sentence longer than ${rule.maxWordsPerSentence} words
- Vocabulary: ${rule.vocabulary}
${exemplarBlock}${avoidBlock}
The story must be a real story, not a list of facts. It needs:
- A situation Jina wants something or has a problem
- A middle where she tries and it does not immediately work
- A turning point where something changes
- An ending that resolves it and quietly demonstrates the unit's skill

Do not stop after setting the scene. A story that introduces Jina and her problem but
never reaches the moment it turns is unusable. Before you finish, check that your story
actually resolves.

Each page needs an "imageQuery": 2-4 plain words naming what a picture for that page
should show (e.g. "mango tree", "kenyan market", "weaver bird"). Use concrete objects,
animals and places -- never a person's name, and never an abstract idea.

Also write ${level === "PP1" || level === "PP2" ? "exactly 2 comprehension questions, ALL of type multiple_choice with short 1-3 word options (this age cannot type)" : "3 to 4 comprehension questions mixing multiple_choice, fill_blank and at most one reflection"}.

Respond with ONLY valid JSON in exactly this structure:
{
  "title": "...",
  "objective": "By the end of this story, the learner should be able to...",
  "pages": [
    { "text": "...", "imageQuery": "..." }
  ],
  "vocabulary": ["...", "...", "...", "...", "..."],
  "activities": [
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." }
  ],
  "funFact": "One true, interesting fact related to the story"
}`;
}

async function generateStoryForUnit(unitId: string): Promise<number> {
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    include: {
      subject: { include: { grade: true } },
      stories: { select: { sequence: true, title: true }, orderBy: { sequence: "desc" } },
    },
  });
  if (!unit) return 0;
  if (unit.stories.length >= unit.targetStoryCount) return 0;

  const gradeCode = unit.subject.grade.code;
  const level = levelForGradeCode(gradeCode);
  const nextSequence = (unit.stories[0]?.sequence ?? 0) + 1;

  const exemplar = authoredStoryForUnit(gradeCode, unit.subject.slug, unit.sequence) ?? null;
  // Without an exemplar the model has nothing anchoring its voice or length, and in
  // practice produces something well off-level. Every existing unit has one; skipping
  // is the honest response for a unit added later without authored content.
  if (!exemplar) {
    console.warn(`  ⚠️  Unit "${unit.title}" has no authored exemplar story — skipping`);
    return 0;
  }

  console.log(`  📖 Unit: "${unit.title}" [${gradeCode} ${unit.subject.name}, level ${level}] — generating draft`);

  const prompt = buildStoryPrompt(
    unit.subject.grade.name,
    level,
    unit.subject.name,
    unit.title,
    unit.outcomes,
    exemplar,
    unit.stories.map((s) => s.title),
    unit.subject.slug === "kiswahili"
  );

  let story: GeneratedStory | null = null;
  try {
    const ollamaOpts = { model: STORY_OLLAMA_MODEL, think: true };
    // Higher than the faith worker's 2500: a G3 story is 14 pages of prose plus
    // activities, which is the longest single artefact any worker here generates.
    const raw = await callOllama(prompt, 3500, ollamaOpts);
    story = extractJson<GeneratedStory>(raw);
    if (!story) {
      const raw2 = await callOllama(
        prompt + "\n\nRemember: respond with ONLY the JSON object, no other text.",
        3500,
        ollamaOpts
      );
      story = extractJson<GeneratedStory>(raw2);
    }
  } catch (err) {
    console.error(`    ❌ Ollama error: ${err}`);
    return 0;
  }

  if (!story || !story.pages || !story.activities || !story.title) {
    console.warn(`    ⚠️  Malformed story response, skipping`);
    return 0;
  }

  const shapeError = validateStoryShape(
    { pages: story.pages, activities: story.activities, vocabulary: story.vocabulary },
    level
  );
  if (shapeError) {
    console.warn(`    ⚠️  Invalid story shape, skipping: ${shapeError}`);
    return 0;
  }

  const gamesError = validateGamesShape(story.games);
  if (gamesError) {
    // Games are optional and derivable from the story's own content, so a bad `games`
    // field is not worth discarding an otherwise good story over -- drop just the games.
    console.warn(`    ⚠️  Dropping malformed games: ${gamesError}`);
    story.games = undefined;
  }

  await db.story.create({
    data: {
      unitId,
      sequence: nextSequence,
      title: story.title,
      objective: story.objective ?? "",
      readingLevel: level,
      pages: story.pages as never,
      vocabulary: Array.isArray(story.vocabulary) ? (story.vocabulary as string[]) : [],
      activities: story.activities as never,
      games: (story.games ?? null) as never,
      funFact: story.funFact,
      duration: READING_LEVELS[level].durationMinutes,
      source: "ai-generated",
      status: "draft",
    },
  });

  console.log(`    ✓ Draft saved for review: "${story.title}"`);
  return 1;
}

async function run() {
  const start = Date.now();
  console.log(`\n🦒📖 Story Generator started at ${new Date().toISOString()}`);

  const units = await db.unit.findMany({
    include: { _count: { select: { stories: true } }, subject: { include: { grade: true } } },
  });

  const underStocked = units.filter((u) => u._count.stories < u.targetStoryCount);
  console.log(`Found ${underStocked.length} units below target story count`);

  let totalCreated = 0;
  const errors: string[] = [];

  for (const unit of underStocked) {
    if (totalCreated >= MAX_TOTAL_PER_RUN) {
      console.log(`  ⏸️  Reached MAX_TOTAL_PER_RUN (${MAX_TOTAL_PER_RUN}) — remaining units continue next run`);
      break;
    }
    try {
      totalCreated += await generateStoryForUnit(unit.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Unit "${unit.title}": ${msg}`);
      errors.push(`${unit.title}: ${msg}`);
    }
  }

  const durationMs = Date.now() - start;
  await db.generatorLog.create({
    data: {
      workerType: "story",
      unitsProcessed: underStocked.length,
      lessonsCreated: totalCreated,
      errors,
      durationMs,
    },
  });

  console.log(`\n✅ Story Generator done — ${totalCreated} new draft(s), ${(durationMs / 1000).toFixed(1)}s`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Story Generator fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
