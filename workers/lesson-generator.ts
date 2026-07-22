/**
 * Lesson Generator Worker — runs nightly at 04:30 UTC via PM2 cron, inside Ollama's
 * 22:00-06:00 UTC active window but clear of port/publisher-site's own cron minutes.
 * Uses Ollama (Qwen 2.5, already on the Hetzner server) to generate
 * new CBC-aligned lessons for units that are below their targetLessonCount.
 *
 * PM2: pm2 start workers/lesson-generator.js --name learn-lesson-worker --cron "30 4 * * *"
 */

import "dotenv/config";
import { createScriptDb } from "../lib/db-script";
import { callOllama, extractJson } from "../lib/ollama";
import { validateLessonShape } from "../lib/lesson-validation";

const db = createScriptDb();
const MAX_LESSONS_PER_UNIT = Number(process.env.LESSON_GEN_MAX_PER_UNIT ?? 5);
// Ceiling on total lessons generated across ALL units in one run, so expanding the
// curriculum (more units) doesn't spike a single night's Ollama load -- a bigger
// backlog just spreads generation over more nights instead of one long run.
const MAX_TOTAL_PER_RUN = Number(process.env.LESSON_GEN_MAX_TOTAL_PER_RUN ?? 8);

interface GeneratedLesson {
  title: string;
  objective: string;
  content: unknown[];
  activities: unknown[];
  funFact?: string;
}

function buildPrompt(
  gradeCode: string,
  gradeName: string,
  subjectName: string,
  unitTitle: string,
  outcomes: string[],
  existingTitles: string[]
): string {
  // PP1/PP2 (ages 4-6) are pre-readers: typing (fill_blank) and reading two columns
  // to operate a dropdown (matching) are a poor fit. Keep them to tap-only
  // multiple_choice with short, concrete options, and fewer of them per lesson.
  const isPreReader = gradeCode.startsWith("PP");
  const activityGuidance = isPreReader
    ? `- Include exactly 2 activities, ALL of type "multiple_choice" only (no fill_blank, no matching -- this age group cannot type or operate dropdowns yet)
- Keep each question's options short (1-3 words), concrete, and easy to pair with a picture/emoji`
    : `- Include 2-4 activities (mix of multiple_choice, fill_blank, and matching types)`;
  const activitiesExample = isPreReader
    ? `  "activities": [
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." }
  ],`
    : `  "activities": [
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
    { "type": "fill_blank", "sentence": "The ___ is ...", "answer": "..." }
  ],`;

  return `You are a Kenya CBC curriculum expert writing lessons for ${gradeName} (age ${gradeCode.startsWith("PP") ? "4-6" : gradeCode.replace("G", "") + " class"}) students.

Subject: ${subjectName}
Unit: ${unitTitle}
CBC Learning Outcomes:
${outcomes.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Existing lesson titles in this unit (do NOT duplicate these):
${existingTitles.length ? existingTitles.map((t) => `- ${t}`).join("\n") : "None yet"}

Create ONE new, age-appropriate lesson for this unit. The lesson must:
- Be fun, engaging, and suitable for Kenyan children
- Use simple language and relatable examples (Kenyan animals, foods, places, names)
${activityGuidance}
- NOT duplicate any existing lesson title listed above
- For a normal "activity" content block, "items" MUST be a flat array of plain
  strings, e.g. ["Touch your nose", "Jump twice"] -- NEVER an array of objects like
  [{"item": "...", "sound_effect": "..."}]. If you want one object/picture per item,
  that is NOT a plain "activity" -- use "picture-match" instead, described next.
- If (and ONLY if) you want a "point to the picture when you hear its sound" style
  exercise (a concrete object plus its sound, e.g. a drum going "boom boom"), use a
  SEPARATE content block with "type": "picture-match" and "pictureItems": an array of
  {"label": "...", "sound": "..."} objects. "label" is the object's name (used to find
  a real picture of it) and "sound" is optional onomatopoeia text -- omit "sound"
  entirely for a visual-only exercise with nothing to listen for (e.g. matching colors
  or shapes).

Respond with ONLY valid JSON matching this exact structure:
{
  "title": "Lesson title here",
  "objective": "By the end of this lesson, the learner should be able to...",
  "content": [
    { "type": "introduction", "text": "..." },
    { "type": "explanation", "text": "...", "example": "..." },
    { "type": "activity", "instruction": "...", "items": ["...", "..."] }
  ],
${activitiesExample}
  "funFact": "An interesting fact related to the topic..."
}

If this lesson calls for a picture/sound matching exercise, replace the "activity"
content block above with this shape instead:
    { "type": "picture-match", "instruction": "...", "pictureItems": [{ "label": "Drum", "sound": "boom boom" }, { "label": "Bell", "sound": "ring ring" }] }`;
}

async function generateLessonsForUnit(unitId: string): Promise<number> {
  const unit = await db.unit.findUnique({
    where: { id: unitId },
    include: {
      lessons: { select: { title: true, sequence: true }, orderBy: { sequence: "desc" } },
      subject: { include: { grade: true } },
    },
  });
  if (!unit) return 0;

  const currentCount = unit.lessons.length;
  const needed = Math.min(unit.targetLessonCount - currentCount, MAX_LESSONS_PER_UNIT);
  if (needed <= 0) return 0;

  let nextSequence = (unit.lessons[0]?.sequence ?? 0) + 1;
  let created = 0;
  const existingTitles = unit.lessons.map((l) => l.title);

  console.log(`  📚 Unit: "${unit.title}" [${unit.subject.grade.code} ${unit.subject.name}] — generating ${needed} lesson(s)`);

  for (let i = 0; i < needed; i++) {
    const prompt = buildPrompt(
      unit.subject.grade.code,
      unit.subject.grade.name,
      unit.subject.name,
      unit.title,
      unit.outcomes,
      existingTitles
    );

    let lesson: GeneratedLesson | null = null;
    try {
      const raw = await callOllama(prompt);
      lesson = extractJson<GeneratedLesson>(raw);
      if (!lesson) {
        // One retry
        const raw2 = await callOllama(prompt + "\n\nRemember: respond with ONLY the JSON object, no other text.");
        lesson = extractJson<GeneratedLesson>(raw2);
      }
    } catch (err) {
      console.error(`    ❌ Ollama error: ${err}`);
      break;
    }

    if (!lesson || !lesson.title || !lesson.content || !lesson.activities) {
      console.warn(`    ⚠️  Malformed lesson response, skipping`);
      continue;
    }

    const shapeError = validateLessonShape(lesson);
    if (shapeError) {
      console.warn(`    ⚠️  Invalid content shape, skipping: ${shapeError}`);
      continue;
    }

    // Duplicate check
    if (existingTitles.some((t) => t.toLowerCase() === lesson!.title.toLowerCase())) {
      console.warn(`    ⚠️  Duplicate title "${lesson.title}", skipping`);
      continue;
    }

    await db.lesson.create({
      data: {
        unitId,
        sequence: nextSequence++,
        title: lesson.title,
        objective: lesson.objective ?? "",
        content: lesson.content as never,
        activities: lesson.activities as never,
        funFact: lesson.funFact,
        source: "ai-generated",
        status: "published",
      },
    });

    existingTitles.push(lesson.title);
    created++;
    console.log(`    ✓ "${lesson.title}"`);
  }

  return created;
}

async function run() {
  const start = Date.now();
  console.log(`\n🤖 Lesson Generator started at ${new Date().toISOString()}`);

  // Find units that need more lessons
  const units = await db.unit.findMany({
    include: {
      _count: { select: { lessons: true } },
      subject: { include: { grade: true } },
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
      const created = await generateLessonsForUnit(unit.id);
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
      workerType: "lesson",
      unitsProcessed: underStocked.length,
      lessonsCreated: totalCreated,
      errors,
      durationMs,
    },
  });

  console.log(`\n✅ Lesson Generator done — ${totalCreated} new lessons, ${(durationMs / 1000).toFixed(1)}s`);
  await db.$disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("Lesson Generator fatal error:", err);
  await db.$disconnect();
  process.exit(1);
});
