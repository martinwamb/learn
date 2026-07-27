// Adapts a Story row into the LessonData shape the player already speaks.
//
// A story is deliberately NOT given its own player: mapping `pages` onto "story-page"
// content blocks means it inherits narration, the Jina mascot, sound effects, picture
// lookup, comprehension scoring and progress recording from LessonPlayer for free, and
// any future improvement to those lands on stories automatically.

import type { ContentBlock, LessonData } from "../lesson/screens";

export interface StoryPage {
  text: string;
  imageQuery?: string;
}

export interface StoryLike {
  title: string;
  objective: string;
  pages: unknown;
  activities: unknown;
  funFact?: string | null;
}

// `pages` arrives as a Prisma Json column with no runtime shape guarantee (an
// AI-generated draft can contain anything the model emitted), so filter defensively
// here for the same reason lib/lesson/screens.ts guards its item arrays: the renderer
// must never receive a non-string where it expects text.
export function asStoryPages(pages: unknown): StoryPage[] {
  if (!Array.isArray(pages)) return [];
  return pages
    .filter((p): p is { text: unknown; imageQuery?: unknown } => !!p && typeof p === "object")
    .map((p) => ({
      text: typeof p.text === "string" ? p.text : "",
      imageQuery: typeof p.imageQuery === "string" ? p.imageQuery : undefined,
    }))
    .filter((p) => p.text.length > 0);
}

export function storyToLessonData(story: StoryLike): LessonData {
  const content: ContentBlock[] = asStoryPages(story.pages).map((page) => ({
    type: "story-page",
    text: page.text,
    imageQuery: page.imageQuery,
  }));

  return {
    title: story.title,
    objective: story.objective,
    content,
    activities: Array.isArray(story.activities) ? (story.activities as LessonData["activities"]) : [],
    funFact: story.funFact ?? null,
  };
}
