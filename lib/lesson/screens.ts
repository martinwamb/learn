export interface ContentBlock {
  type: "introduction" | "explanation" | "activity";
  text?: string;
  example?: string;
  instruction?: string;
  items?: string[];
  // Explicit opt-in for "point to the picture when you hear its sound" style
  // activities -- most activity blocks are physical actions, poem lines, math, etc.,
  // NOT a picture/sound-lookup target, so media only fetches when this is set.
  mediaKind?: "sound-match";
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
  | { kind: "item"; blockIdx: number; itemIdx: number; item: string; instruction: string; mediaKind?: "sound-match" }
  | { kind: "item-group"; blockIdx: number; instruction: string; items: string[]; mediaKind?: "sound-match" }
  | { kind: "memory-verse"; text: string; reference: string }
  | { kind: "funfact"; text: string }
  | { kind: "question"; actIdx: number }
  | { kind: "complete" };

// A block's items[] become individual tap-through screens when the picture/sound is
// the point (mediaKind: "sound-match") or the list is short enough that one screen per
// item doesn't feel tedious. Longer lists (poems, multi-step counting) stay as one
// screen with a tap-each-to-hear list instead of forcing many taps through a sequence.
// Validated against real production content: ~75% of activity blocks have <= 3 items.
export const ITEM_SPLIT_THRESHOLD = 3;

export function buildScreens(lesson: LessonData): Screen[] {
  const screens: Screen[] = [{ kind: "welcome" }];

  lesson.content.forEach((block, blockIdx) => {
    if (block.type === "introduction") {
      if (block.text) screens.push({ kind: "content", blockIdx, text: block.text });
    } else if (block.type === "explanation") {
      const text = block.example
        ? `${block.text ?? ""}${block.text ? "\n\n" : ""}For example: ${block.example}`
        : block.text ?? "";
      if (text) screens.push({ kind: "content", blockIdx, text });
    } else if (block.type === "activity") {
      const items = block.items ?? [];
      if (!items.length) {
        if (block.instruction) screens.push({ kind: "content", blockIdx, text: block.instruction });
        return;
      }
      const splitIndividually = block.mediaKind === "sound-match" || items.length <= ITEM_SPLIT_THRESHOLD;
      if (splitIndividually) {
        items.forEach((item, itemIdx) => {
          screens.push({
            kind: "item",
            blockIdx,
            itemIdx,
            item,
            instruction: block.instruction ?? "",
            mediaKind: block.mediaKind,
          });
        });
      } else {
        screens.push({
          kind: "item-group",
          blockIdx,
          instruction: block.instruction ?? "",
          items,
          mediaKind: block.mediaKind,
        });
      }
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
