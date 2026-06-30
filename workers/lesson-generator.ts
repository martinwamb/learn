/**
 * Lesson Generator Worker — runs nightly at 03:00 EAT via PM2 cron.
 * Uses Ollama (Qwen 2.5, already on the Hetzner server) to generate
 * new CBC-aligned lessons for units that are below their targetLessonCount.
 *
 * PM2: pm2 start workers/lesson-generator.js --name learn-lesson-worker --cron "0 3 * * *"
 */

import "dotenv/config";
import { createScriptDb } from "../lib/db-script";

const db = createScriptDb();
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen3:14b";
const MAX_LESSONS_PER_UNIT = Number(process.env.LESSON_GEN_MAX_PER_UNIT ?? 5);

interface GeneratedLesson {
  title: string;
  objective: string;
  content: unknown[];
  activities: unknown[];
  funFact?: string;
}

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      think: false,
      options: { temperature: 0.7, num_predict: 700 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return data.response as string;
}

function buildPrompt(
  gradeCode: string,
  gradeName: string,
  subjectName: string,
  unitTitle: string,
  outcomes: string[],
  existingTitles: string[]
): string {
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
- Include 2-4 activities (mix of multiple_choice, fill_blank, and matching types)
- NOT duplicate any existing lesson title listed above

Respond with ONLY valid JSON matching this exact structure:
{
  "title": "Lesson title here",
  "objective": "By the end of this lesson, the learner should be able to...",
  "content": [
    { "type": "introduction", "text": "..." },
    { "type": "explanation", "text": "...", "example": "..." },
    { "type": "activity", "instruction": "...", "items": ["...", "..."] }
  ],
  "activities": [
    { "type": "multiple_choice", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." },
    { "type": "fill_blank", "sentence": "The ___ is ...", "answer": "..." }
  ],
  "funFact": "An interesting fact related to the topic..."
}`;
}

function extractJson(raw: string): GeneratedLesson | null {
  // Find first { and last } to extract JSON even if model adds extra text
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as GeneratedLesson;
  } catch {
    return null;
  }
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
      lesson = extractJson(raw);
      if (!lesson) {
        // One retry
        const raw2 = await callOllama(prompt + "\n\nRemember: respond with ONLY the JSON object, no other text.");
        lesson = extractJson(raw2);
      }
    } catch (err) {
      console.error(`    ❌ Ollama error: ${err}`);
      break;
    }

    if (!lesson || !lesson.title || !lesson.content || !lesson.activities) {
      console.warn(`    ⚠️  Malformed lesson response, skipping`);
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
