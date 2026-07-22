"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validateLessonShape } from "@/lib/lesson-validation";

// Re-checked on every action, not just the page: server actions are directly
// callable POST endpoints once their action ID is known client-side, so gating
// only the page's render isn't enough.
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Not authorized");
  }
}

export async function publishDraft(lessonId: string) {
  await requireAdmin();
  await db.religiousLesson.update({
    where: { id: lessonId },
    data: { status: "published" },
  });
  revalidatePath("/admin/faith-review");
}

export async function discardDraft(lessonId: string) {
  await requireAdmin();
  // Safe to hard-delete: no UserProgress can reference a still-draft lesson,
  // since kids only ever see status:"published" lessons. Note this re-opens the
  // parent unit to the worker trying again next run.
  await db.religiousLesson.delete({ where: { id: lessonId } });
  revalidatePath("/admin/faith-review");
}

export async function editAndPublish(lessonId: string, formData: FormData) {
  await requireAdmin();

  const objective = formData.get("objective");
  const funFact = formData.get("funFact");
  const contentRaw = formData.get("content");
  const activitiesRaw = formData.get("activities");

  if (typeof objective !== "string" || typeof contentRaw !== "string" || typeof activitiesRaw !== "string") {
    throw new Error("Missing required fields");
  }

  let content: unknown[];
  let activities: unknown[];
  try {
    content = JSON.parse(contentRaw);
    activities = JSON.parse(activitiesRaw);
  } catch {
    throw new Error("Content and activities must be valid JSON");
  }

  const shapeError = validateLessonShape({ content, activities });
  if (shapeError) {
    throw new Error(`Invalid content shape: ${shapeError}`);
  }

  await db.religiousLesson.update({
    where: { id: lessonId },
    data: {
      objective,
      funFact: typeof funFact === "string" && funFact.trim().length > 0 ? funFact : null,
      content: content as never,
      activities: activities as never,
      status: "published",
    },
  });

  revalidatePath("/admin/faith-review");
}
