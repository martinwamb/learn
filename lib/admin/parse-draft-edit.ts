import { validateLessonShape } from "@/lib/lesson-validation";

export interface ParsedDraftEdit {
  objective: string;
  content: unknown[];
  activities: unknown[];
  funFact: string | null;
}

// Shared by /admin/faith-review and /admin/cbc-review's editAndPublish actions --
// both hand-edit the same content/activities JSON shape before publishing.
// Throws on any problem; callers let the error surface to the form submission.
export function parseDraftEdit(formData: FormData): ParsedDraftEdit {
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

  return {
    objective,
    content,
    activities,
    funFact: typeof funFact === "string" && funFact.trim().length > 0 ? funFact : null,
  };
}
