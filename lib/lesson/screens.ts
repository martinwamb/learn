export interface PictureItem {
  label: string;
  sound?: string;
}

export interface ContentBlock {
  type: "introduction" | "explanation" | "activity" | "picture-match" | "story-page" | "memory-verse";
  text?: string;
  example?: string;
  instruction?: string;
  items?: string[]; // "activity" only -- plain text, never gets pictures/sound
  pictureItems?: PictureItem[]; // "picture-match" only -- always gets a picture, sound is optional per item
  // "story-page" only -- one page of a Jina story: a picture and the prose beneath
  // it. Unlike "picture-match" (where the label IS the thing being taught), here the
  // text is the content and the picture only illustrates it, so the query is separate.
  imageQuery?: string;
  // "memory-verse" only -- the scripture/quote attribution shown under the text.
  reference?: string;
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
  | { kind: "story-page"; blockIdx: number; pageNo: number; totalPages: number; text: string; imageQuery?: string }
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

  // Story pages carry "page 3 of 10" in their own screen data rather than reusing the
  // generic screen counter, because the counter includes the welcome/question/complete
  // screens too -- a child reading a 10-page story should see 10, not 17.
  const totalPages = lesson.content.filter((b) => b.type === "story-page").length;
  let pageNo = 0;

  lesson.content.forEach((block, blockIdx) => {
    if (block.type === "story-page") {
      if (typeof block.text !== "string" || !block.text) return;
      pageNo += 1;
      screens.push({
        kind: "story-page",
        blockIdx,
        pageNo,
        totalPages,
        text: block.text,
        imageQuery: typeof block.imageQuery === "string" ? block.imageQuery : undefined,
      });
    } else if (block.type === "memory-verse") {
      // Previously missing: the ContentBlock type, the Screen variant and
      // LessonPlayer's render branch all existed, but with no branch here
      // buildScreens never emitted one -- so every memory verse that
      // prisma/seed-faith.ts seeded and every one the faith worker generated was
      // silently dropped before it reached a child. It rendered correctly in
      // /admin/faith-review (which uses DraftReviewCard, not buildScreens), which
      // is why it looked fine on review and then vanished in the player.
      if (typeof block.text === "string" && block.text) {
        screens.push({
          kind: "memory-verse",
          text: block.text,
          reference: typeof block.reference === "string" ? block.reference : "",
        });
      }
    } else if (block.type === "introduction") {
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
