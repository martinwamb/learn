import { validateLessonShape } from "@/lib/lesson-validation";
import { validateStoryShape } from "@/lib/story-validation";
import type { ReadingLevel } from "@/lib/story/reading-levels";

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

export interface ParsedStoryDraftEdit {
  objective: string;
  pages: unknown[];
  activities: unknown[];
  funFact: string | null;
}

// The story equivalent, used by /admin/story-review. Reuses the same form field names
// as the shared DraftReviewCard (which posts the page array under "content"), then
// validates against the story's reading level rather than the lesson content rules --
// an admin editing a PP1 story must not be able to publish 20-word sentences into it.
export function parseStoryDraftEdit(formData: FormData, level: ReadingLevel): ParsedStoryDraftEdit {
  const objective = formData.get("objective");
  const funFact = formData.get("funFact");
  const pagesRaw = formData.get("content");
  const activitiesRaw = formData.get("activities");

  if (typeof objective !== "string" || typeof pagesRaw !== "string" || typeof activitiesRaw !== "string") {
    throw new Error("Missing required fields");
  }

  let pages: unknown[];
  let activities: unknown[];
  try {
    pages = JSON.parse(pagesRaw);
    activities = JSON.parse(activitiesRaw);
  } catch {
    throw new Error("Pages and activities must be valid JSON");
  }

  const shapeError = validateStoryShape({ pages, activities }, level);
  if (shapeError) {
    throw new Error(`Invalid story shape: ${shapeError}`);
  }

  // Normalise to exactly {text, imageQuery}. The review card renders pages as
  // "story-page" content blocks so it can reuse its existing block renderer, which
  // means the textarea it prefills carries a `type` key that does not belong in the
  // stored data -- without this, every edit-and-publish round trip would persist it.
  const normalisedPages = (pages as Record<string, unknown>[]).map((p) => ({
    text: String(p.text),
    imageQuery: String(p.imageQuery),
  }));

  return {
    objective,
    pages: normalisedPages,
    activities,
    funFact: typeof funFact === "string" && funFact.trim().length > 0 ? funFact : null,
  };
}
