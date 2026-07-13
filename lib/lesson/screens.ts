export interface PictureItem {
  label: string;
  sound?: string;
}

export interface ContentBlock {
  type: "introduction" | "explanation" | "activity" | "picture-match";
  text?: string;
  example?: string;
  instruction?: string;
  items?: string[]; // "activity" only -- plain text, never gets pictures/sound
  pictureItems?: PictureItem[]; // "picture-match" only -- always gets a picture, sound is optional per item
}

export interface Activity {
  type: "multiple_choice" | "fill_blank" | "matching" | "reflection";
  question?: string;
  sentence?: string;
  options?: string[];
  answer?: string;
  pairs?: { left: string; right: string }[];
  // "reflection" activities are a prompt to think about, not a graded question --
  // no right/wrong, just a single Continue.
  prompt?: string;
  // Optional picture query for the question itself (e.g. multiple_choice "which
  // animal made this sound?"). Graded questions with a picture belong here, not
  // forced into a "picture-match" content block -- they have a right/wrong answer.
  image?: string;
}

export interface LessonData {
  title: string;
  objective: string;
  content: ContentBlock[];
  activities: Activity[];
  funFact?: string | null;
}

export type Screen =
  | { kind: "welcome" }
  | { kind: "content"; blockIdx: number; text: string }
  | { kind: "item"; blockIdx: number; itemIdx: number; item: string; instruction: string }
  | { kind: "item-group"; blockIdx: number; instruction: string; items: string[] }
  | { kind: "picture-item"; blockIdx: number; itemIdx: number; label: string; sound?: string; instruction: string }
  | { kind: "memory-verse"; text: string; reference: string }
  | { kind: "funfact"; text: string }
  | { kind: "question"; actIdx: number }
  | { kind: "complete" };

// A block's items become individual tap-through screens when the list is short
// enough that one screen per item doesn't feel tedious (validated against real
// production content: ~75% of activity blocks have <= 3 items) -- picture-match
// items always split individually regardless of count, since one picture+sound per
// tap is the entire point of that block type. Longer plain-text lists (poems,
// multi-step counting) stay as one screen with everything visible at once.
export const ITEM_SPLIT_THRESHOLD = 3;

// `content`/`activities` arrive as Prisma Json columns cast through `as never` with
// no runtime shape guarantee (see Phase 1.5 investigation: a small model has produced
// items as objects instead of strings, which would otherwise crash the renderer with
// "Objects are not valid as a React child"). These guards keep buildScreens()'s
// OUTPUT always safe, regardless of what's actually in the database.
function asStringItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.filter((i): i is string => typeof i === "string");
}

function asPictureItems(items: unknown): PictureItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i): i is { label: unknown; sound?: unknown } => !!i && typeof i === "object" && typeof (i as { label?: unknown }).label === "string")
    .map((i) => ({
      label: i.label as string,
      sound: typeof i.sound === "string" ? i.sound : undefined,
    }));
}

export function buildScreens(lesson: LessonData): Screen[] {
  const screens: Screen[] = [{ kind: "welcome" }];

  lesson.content.forEach((block, blockIdx) => {
    if (block.type === "introduction") {
      if (typeof block.text === "string" && block.text) screens.push({ kind: "content", blockIdx, text: block.text });
    } else if (block.type === "explanation") {
      const bodyText = typeof block.text === "string" ? block.text : "";
      const example = typeof block.example === "string" ? block.example : "";
      const text = example ? `${bodyText}${bodyText ? "\n\n" : ""}For example: ${example}` : bodyText;
      if (text) screens.push({ kind: "content", blockIdx, text });
    } else if (block.type === "activity") {
      const items = asStringItems(block.items);
      const instruction = typeof block.instruction === "string" ? block.instruction : "";
      if (!items.length) {
        if (instruction) screens.push({ kind: "content", blockIdx, text: instruction });
        return;
      }
      if (items.length <= ITEM_SPLIT_THRESHOLD) {
        items.forEach((item, itemIdx) => {
          screens.push({ kind: "item", blockIdx, itemIdx, item, instruction });
        });
      } else {
        screens.push({ kind: "item-group", blockIdx, instruction, items });
      }
    } else if (block.type === "picture-match") {
      const items = asPictureItems(block.pictureItems);
      const instruction = typeof block.instruction === "string" ? block.instruction : "";
      if (!items.length) return;
      items.forEach((item, itemIdx) => {
        screens.push({ kind: "picture-item", blockIdx, itemIdx, label: item.label, sound: item.sound, instruction });
      });
    }
  });

  if (lesson.funFact) {
    screens.push({ kind: "funfact", text: lesson.funFact });
  }

  lesson.activities.forEach((_, actIdx) => {
    screens.push({ kind: "question", actIdx });
  });

  screens.push({ kind: "complete" });

  return screens;
}
