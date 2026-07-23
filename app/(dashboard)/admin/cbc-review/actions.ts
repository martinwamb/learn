"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { parseDraftEdit } from "@/lib/admin/parse-draft-edit";

export async function publishDraft(lessonId: string) {
  await requireAdmin();
  await db.lesson.update({
    where: { id: lessonId },
    data: { status: "published" },
  });
  revalidatePath("/admin/cbc-review");
}

export async function discardDraft(lessonId: string) {
  await requireAdmin();
  // Safe to hard-delete: no UserProgress can reference a still-draft lesson,
  // since kids only ever see status:"published" lessons. Note this re-opens the
  // parent unit to the worker trying again next run.
  await db.lesson.delete({ where: { id: lessonId } });
  revalidatePath("/admin/cbc-review");
}

export async function editAndPublish(lessonId: string, formData: FormData) {
  await requireAdmin();
  const edit = parseDraftEdit(formData);

  await db.lesson.update({
    where: { id: lessonId },
    data: {
      objective: edit.objective,
      funFact: edit.funFact,
      content: edit.content as never,
      activities: edit.activities as never,
      status: "published",
    },
  });

  revalidatePath("/admin/cbc-review");
}
