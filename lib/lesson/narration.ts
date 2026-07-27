// Narration text derivation, shared between the client player and server-side
// warmers. Deliberately NOT "use client" and deliberately free of React imports:
// workers/tts-warm.ts pre-synthesizes narration audio ahead of time, and the only
// way a pre-generated file is ever a cache hit is if the worker produces the exact
// same string the browser will later ask for. Keeping one implementation of that
// string here is what makes the cache actually work -- when this logic lived inside
// hooks/useLessonPlayer.ts ("use client"), no server process could reach it.

import type { Activity, LessonData, Screen } from "./screens";

export const CORRECT_PHRASES = [
  "Correct! Well done!",
  "Fantastic! You got it!",
  "Great job! That's right!",
  "Amazing! You're so clever!",
  "Yes! Perfect answer!",
];

export const WRONG_PHRASES = [
  "Not quite — let's keep going!",
  "Good try! Let's move on.",
  "Almost! Keep it up!",
];

export const REFLECTION_PHRASES = ["Great thinking!", "Thanks for sharing that!", "Lovely reflection!"];

export function buildQuestionText(act: Activity): string {
  if (act.type === "multiple_choice") {
    const opts = (act.options ?? []).join(", ");
    return `${act.question}. Is it: ${opts}?`;
  }
  if (act.type === "fill_blank") {
    return `Complete the sentence: ${act.sentence}. What is the missing word?`;
  }
  if (act.type === "matching") {
    return "Match the words on the left with those on the right.";
  }
  if (act.type === "reflection") {
    return act.prompt ?? "";
  }
  return "";
}

export function getScreenNarration(screen: Screen, lesson: LessonData): string {
  switch (screen.kind) {
    case "welcome":
      return "";
    case "content":
      return screen.text;
    case "story-page":
      return screen.text;
    case "item":
      return screen.itemIdx === 0 && screen.instruction
        ? `${screen.instruction} ${screen.item}`
        : screen.item;
    case "item-group":
      return screen.instruction
        ? `${screen.instruction} ${screen.items.join(". ")}`
        : screen.items.join(". ");
    case "picture-item":
      return screen.itemIdx === 0 && screen.instruction
        ? `${screen.instruction} ${screen.label}`
        : screen.label;
    case "memory-verse":
      return `${screen.text} — ${screen.reference}`;
    case "funfact":
      return `Fun fact: ${screen.text}`;
    case "question":
      return buildQuestionText(lesson.activities[screen.actIdx]);
    case "complete":
      return "";
  }
}

export function resolveScreenText(screen: Screen, lesson: LessonData, score: number): string {
  if (screen.kind === "complete") {
    return `Amazing work! You finished the lesson and scored ${score} stars! Keep it up!`;
  }
  return getScreenNarration(screen, lesson);
}

// Every narration string a play-through of this lesson can request, ahead of time.
// Used by the client to batch-prepare audio on mount (app/api/tts/prepare) and by
// workers/tts-warm.ts to pre-fill the disk cache overnight -- same function, so the
// two can never drift apart and miss each other's cache entries.
//
// Excludes the "complete" screen: its text embeds the final score, which isn't known
// until the last question is answered, so there's nothing stable to pre-generate.
export function collectLessonNarrations(lesson: LessonData, screens: Screen[]): string[] {
  const texts = new Set<string>();
  for (const screen of screens) {
    const text = getScreenNarration(screen, lesson);
    if (text) texts.add(text);
  }
  return [...texts];
}

// The fixed feedback lines, which are identical across every lesson in the app --
// warming these once makes answer feedback instant everywhere, forever.
export function collectFeedbackNarrations(lesson: LessonData): string[] {
  const texts = new Set<string>(CORRECT_PHRASES);
  for (const phrase of REFLECTION_PHRASES) texts.add(phrase);
  lesson.activities.forEach((act, actIdx) => {
    if (act.type === "reflection") return;
    const answer = act.answer ?? (act.pairs?.map((p) => `${p.left} — ${p.right}`).join(", ") ?? "");
    texts.add(`${WRONG_PHRASES[actIdx % WRONG_PHRASES.length]} The answer is: ${answer}`);
  });
  return [...texts];
}
