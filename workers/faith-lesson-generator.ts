/**
 * Faith Lesson Generator Worker — runs nightly at 05:05 UTC via PM2 cron, inside
 * Ollama's 22:00-06:00 UTC active window, after the CBC lesson worker (04:30) so
 * the two Ollama-calling workers never race each other.
 *
 * Unlike workers/lesson-generator.ts, this worker does NOT let the model invent
 * what a lesson is about. Every ReligiousUnit's title/scriptureRef/teachingPoint
 * is fixed ahead of time by a curated curriculum (see prisma/faith-curriculum/*.ts,
 * wired in via prisma/seed-faith.ts) -- the model is only asked to write the
 * retelling/activities/fun-fact text for that already-named story and reference.
 * Generated lessons save as status:"draft", never "published" -- a human must
 * review and publish them via /admin/faith-review before kids can see them.
 *
 * PM2: pm2 start workers/faith-lesson-generator.js --name learn-faith-worker --cron "5 5 * * *"
 */

import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { callOllama, extractJson } from "../lib/ollama";
import { validateLessonShape } from "../lib/lesson-validation";

const db = createScriptDb();
// Deliberately independent of LESSON_GEN_MAX_TOTAL_PER_RUN (the CBC worker's budget)
// so neither worker starves the other, and deliberately smaller -- there's no benefit
// generating drafts faster than a single admin can review them.
const MAX_TOTAL_PER_RUN = Number(process.env.FAITH_LESSON_GEN_MAX_TOTAL_PER_RUN ?? 4);

interface GeneratedFaithLesson {
  objective: string;
  content: unknown[];
  activities: unknown[];
  funFact?: string;
}

function buildFaithPrompt(
  traditionName: string,
  unitTitle: string,
  scriptureRef: string | null,
  teachingPoint: string,
  ageMin: number,
  ageMax: number
): string {
  // Mirrors the CBC worker's isPreReader branch: ages 4-6 are pre-readers, so keep
  // activities to tap-only multiple_choice with short concrete options.
  const isEarlyYears = ageMin <= 6;
  const activityGuidance = isEarlyYears
    ? `- Include exactly 2 activities, ALL of type "multiple_choice" only (no fill_blank, no matching -- this age group cannot type or operate dropdowns yet)
- Keep each question's options short (1-3 words), concrete, and easy to pair with a picture/emoji`
    : `- Include 2-4 activities (mix of multiple_choice and fill_blank types)`;
  const activitiesExample = isEarlyYears
    ? `  "activities": [
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." }
  ],`
    : `  "activities": [
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
    { "type": "fill_blank", "sentence": "The ___ is ...", "answer": "..." }
  ],`;

  return `You are writing a children's ${traditionName} lesson for ${ageMin}-${ageMax} year olds in Kenya.

The story/topic for this lesson is already fixed -- you must NOT substitute a
different story, invent a different reference, or change the teaching point:

Title: ${unitTitle}
${scriptureRef ? `Reference: ${scriptureRef}\n` : ""}Teaching point (the lesson MUST teach this, and only this): ${teachingPoint}

Write ONE lesson retelling this story for this exact title and reference. The lesson must:
- Be warm, simple, and age-appropriate -- suitable for Kenyan children
- Stay faithful to the fixed title, reference, and teaching point above
- Use simple language and relatable examples
${activityGuidance}
- For a normal "activity" content block, "items" MUST be a flat array of plain
  strings, e.g. ["Touch your nose", "Jump twice"] -- NEVER an array of objects.
  If you want one object/picture per item, use "picture-match" instead (below).
- If (and ONLY if) you want a "point to the picture when you hear its sound" style
  exercise, use a SEPARATE content block with "type": "picture-match" and
  "pictureItems": an array of {"label": "...", "sound": "..."} objects. Do NOT use
  a picture of a prophet or any person as a "label" -- use objects, places, or
  animals from the story instead (e.g. "Ark", "Dove", "Lamp", "Star").
- You MAY also use these two content-block types where they fit naturally:
  { "type": "memory-verse", "text": "...", "reference": "..." } for a short line
  worth remembering, and { "type": "item", "instruction": "...", "items": ["...", "..."] }
  or { "type": "item-group", "instruction": "...", "items": ["...", "..."] } for a
  simple discussion or ordering exercise.

Respond with ONLY valid JSON matching this exact structure (do NOT include a
"title" field -- the title is already fixed above):
{
  "objective": "By the end of this lesson, the learner should be able to...",
  "content": [
    { "type": "introduction", "text": "..." },
    { "type": "explanation", "text": "...", "example": "..." }
  ],
${activitiesExample}
  "funFact": "An interesting fact related to the story..."
}`;
}

async function generateLessonForUnit(unitId: string): Promise<number> {
  const unit = await db.religiousUnit.findUnique({
    where: { id: unitId },
    include: {
      lessons: { select: { sequence: true }, orderBy: { sequence: "desc" } },
      tradition: true,
    },
  });
  if (!unit) return 0;

  const needed = Math.min(unit.targetLessonCount - unit.lessons.length, 1);
  if (needed <= 0) return 0;

  if (!unit.teachingPoint) {
    console.warn(`  ⚠️  Unit "${unit.title}" has no teachingPoint -- skipping rather than generating an unconstrained retelling`);
    return 0;
  }

  const nextSequence = (unit.lessons[0]?.sequence ?? 0) + 1;

  console.log(`  📖 Unit: "${unit.title}" [${unit.tradition.name}, ages ${unit.ageMin}-${unit.ageMax}] — generating draft`);

  const prompt = buildFaithPrompt(
    unit.tradition.name,
    unit.title,
    unit.scriptureRef,
    unit.teachingPoint,
    unit.ageMin,
    unit.ageMax
  );

  let lesson: GeneratedFaithLesson | null = null;
  try {
    const raw = await callOllama(prompt);
    lesson = extractJson<GeneratedFaithLesson>(raw);
    if (!lesson) {
      // One retry
      const raw2 = await callOllama(prompt + "\n\nRemember: respond with ONLY the JSON object, no other text.");
      lesson = extractJson<GeneratedFaithLesson>(raw2);
    }
  } catch (err) {
    console.error(`    ❌ Ollama error: ${err}`);
    return 0;
  }

  if (!lesson || !lesson.content || !lesson.activities) {
    console.warn(`    ⚠️  Malformed lesson response, skipping`);
    return 0;
  }

  const shapeError = validateLessonShape(lesson);
  if (shapeError) {
    console.warn(`    ⚠️  Invalid content shape, skipping: ${shapeError}`);
    return 0;
  }

  await db.religiousLesson.create({
    data: {
      unitId,
      sequence: nextSequence,
      title: unit.title,
      objective: lesson.objective ?? "",
      content: lesson.content as never,
      activities: lesson.activities as never,
      funFact: lesson.funFact,
      source: "ai-generated",
      status: "draft",
    },
  });

  console.log(`    ✓ Draft saved for review: "${unit.title}"`);
  return 1;
}

async function run() {
  const start = Date.now();
  console.log(`\n🙏🤖 Faith Lesson Generator started at ${new Date().toISOString()}`);

  const units = await db.religiousUnit.findMany({
    include: {
      _count: { select: { lessons: true } },
      tradition: true,
    },
  });

  const underStocked = units.filter((u) => u._count.lessons < u.targetLessonCount);
  console.log(`Found ${underStocked.length} units below target lesson count`);

  let totalCreated = 0;
  const errors: string[] = [];

  for (const unit of underStocked) {
    if (totalCreated >= MAX_TOTAL_PER_RUN) {
      console.log(`  ⏸️  Reached MAX_TOTAL_PER_RUN (${MAX_TOTAL_PER_RUN}) — remaining units continue next run`);
      break;
    }
    try {
      const created = await generateLessonForUnit(unit.id);
      totalCreated += created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Unit "${unit.title}": ${msg}`);
      errors.push(`${unit.title}: ${msg}`);
    }
  }

  const durationMs = Date.now() - start;
  await db.generatorLog.create({
    data: {
      workerType: "faith-lesson",
      unitsProcessed: underStocked.length,
      lessonsCreated: totalCreated,
      errors,
      durationMs,
    },
  });

  console.log(`\n✅ Faith Lesson Generator done — ${totalCreated} new draft(s), ${(durationMs / 1000).toFixed(1)}s`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Faith Lesson Generator fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
