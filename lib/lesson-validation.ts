// Shared between workers/lesson-generator.ts (CBC) and workers/faith-lesson-generator.ts
// (Faith Stories) -- both ask Ollama for the same lesson.content/lesson.activities JSON
// shape and hand it to the same LessonPlayer component, so one shape check serves both.

export interface LessonContentShape {
  content: unknown[];
  activities: unknown[];
}

// Small models don't reliably follow "add this optional field" prompt instructions --
// confirmed in production: every AI-generated picture/sound lesson since the prompt
// asked for it came back untagged, and some came back with "items" as an array of
// objects instead of plain strings (which crashes the renderer -- objects aren't valid
// React children). Validate the shape server-side rather than trusting the model, and
// skip (same as the existing malformed-JSON handling) rather than save bad data.
export function validateLessonShape(lesson: LessonContentShape): string | null {
  if (!Array.isArray(lesson.content)) return "content is not an array";
  for (const block of lesson.content as Record<string, unknown>[]) {
    if (!block || typeof block !== "object") return "a content block is not an object";
    if (block.type === "activity" && block.items !== undefined) {
      if (!Array.isArray(block.items) || block.items.some((i) => typeof i !== "string")) {
        return `activity block's items must be a flat array of strings, got: ${JSON.stringify(block.items)}`;
      }
    }
    if (block.type === "picture-match") {
      const items = block.pictureItems;
      const valid =
        Array.isArray(items) &&
        items.length > 0 &&
        items.every((i) => i && typeof i === "object" && typeof (i as { label?: unknown }).label === "string");
      if (!valid) {
        return `picture-match block's pictureItems must be [{label, sound?}], got: ${JSON.stringify(items)}`;
      }
    }
  }
  if (!Array.isArray(lesson.activities)) return "activities is not an array";
  for (const act of lesson.activities as Record<string, unknown>[]) {
    if (!act || typeof act !== "object" || typeof act.type !== "string") return "an activity item is malformed";
  }
  return null;
}
