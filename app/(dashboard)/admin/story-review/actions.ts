"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { parseStoryDraftEdit } from "@/lib/admin/parse-draft-edit";
import { isReadingLevel, levelForGradeCode } from "@/lib/story/reading-levels";
import { warmStoryNarration } from "@/lib/tts/warm-content";

export async function publishDraft(storyId: string) {
  await requireAdmin();
  const story = await db.story.update({
    where: { id: storyId },
    data: { status: "published" },
  });
  // Pre-generate this story's narration now rather than leaving the first child who
  // opens it to pay for the synthesis. Fire-and-forget: publishing must not block on it.
  warmStoryNarration(story).catch((err) => console.error("warm after publish failed:", err));
  revalidatePath("/admin/story-review");
}

export async function discardDraft(storyId: string) {
  await requireAdmin();
  // Safe to hard-delete: no UserProgress can reference a still-draft story, since kids
  // only ever see status:"published". This re-opens the unit to the worker next run.
  await db.story.delete({ where: { id: storyId } });
  revalidatePath("/admin/story-review");
}

export async function editAndPublish(storyId: string, formData: FormData) {
  await requireAdmin();

  const existing = await db.story.findUnique({
    where: { id: storyId },
    include: { unit: { include: { subject: { include: { grade: true } } } } },
  });
  if (!existing) throw new Error("Story not found");

  // Validate the edit against the story's own reading level, falling back to the unit's
  // grade if the stored level is somehow not one we recognise.
  const level = isReadingLevel(existing.readingLevel)
    ? existing.readingLevel
    : levelForGradeCode(existing.unit.subject.grade.code);

  const edit = parseStoryDraftEdit(formData, level);

  const story = await db.story.update({
    where: { id: storyId },
    data: {
      objective: edit.objective,
      funFact: edit.funFact,
      pages: edit.pages as never,
      activities: edit.activities as never,
      status: "published",
    },
  });

  warmStoryNarration(story).catch((err) => console.error("warm after publish failed:", err));
  revalidatePath("/admin/story-review");
}
