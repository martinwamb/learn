// Warms a single piece of content's narration on demand.
//
// workers/tts-warm.ts sweeps everything published overnight, but a lesson or story
// published from the admin queue during the day would otherwise sit cold until the next
// run -- and the child who opens it first pays the full synthesis cost. This closes that
// window. Callers should treat it as fire-and-forget: publishing must never block on it.

import { buildScreens, type LessonData } from "../lesson/screens";
import { collectFeedbackNarrations, collectLessonNarrations } from "../lesson/narration";
import { storyToLessonData, type StoryLike } from "../story/to-lesson-data";
import { ensureAudio, mapWithConcurrency } from "./cache";

async function warm(lesson: LessonData): Promise<void> {
  const screens = buildScreens(lesson);
  const texts = [...collectLessonNarrations(lesson, screens), ...collectFeedbackNarrations(lesson)];
  await mapWithConcurrency(texts, 3, async (text) => {
    // One failed clip must not abort the rest -- the player falls back to /api/tts/speak
    // for anything still missing, so a partial warm is strictly better than none.
    await ensureAudio(text).catch(() => {});
  });
}

export async function warmLessonNarration(lesson: LessonData): Promise<void> {
  return warm(lesson);
}

export async function warmStoryNarration(story: StoryLike): Promise<void> {
  return warm(storyToLessonData(story));
}
