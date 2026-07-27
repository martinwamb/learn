// Derives playable games from content that was authored before games existed.
//
// This is what makes the feature worth shipping on day one: every lesson already in the
// database (181 of them in production, none with a `games` column set) gets real games
// without anyone re-authoring anything. Hand-authored `games` always win -- derivation
// only runs when the column is null or empty.

import type { Activity, ContentBlock, LessonData } from "../lesson/screens";
import type { GameSpec } from "./types";
import { parseGames } from "./validation";

function pairMatchFromActivities(activities: Activity[]): GameSpec | null {
  const pairs = activities
    .filter((a) => a.type === "matching")
    .flatMap((a) => a.pairs ?? [])
    .filter((p) => p && typeof p.left === "string" && typeof p.right === "string");
  if (pairs.length < 2) return null;
  return { type: "pair-match", title: "Match them up", pairs: pairs.slice(0, 6) };
}

function pairMatchFromPictureBlocks(content: ContentBlock[]): GameSpec | null {
  // A picture-match block pairs a label with a sound ("Cow" / "Moo"). That's already a
  // matching game -- it was just never playable as one.
  const pairs = content
    .filter((b) => b.type === "picture-match")
    .flatMap((b) => b.pictureItems ?? [])
    .filter((i) => i.label && i.sound)
    .map((i) => ({ left: i.label, right: i.sound as string }));
  if (pairs.length < 2) return null;
  return { type: "pair-match", title: "Match the sound", pairs: pairs.slice(0, 6) };
}

const NUMERIC = /^-?\d+(\.\d+)?$/;

function numberPopFromActivities(activities: Activity[]): GameSpec | null {
  // Only multiple-choice questions whose options are ALL numbers -- a maths question.
  // Anything else would turn "pop the right number" into a reading test with balloons.
  const rounds = activities
    .filter(
      (a) =>
        a.type === "multiple_choice" &&
        typeof a.question === "string" &&
        typeof a.answer === "string" &&
        NUMERIC.test(a.answer.trim()) &&
        (a.options ?? []).length >= 2 &&
        (a.options ?? []).every((o) => NUMERIC.test(o.trim()))
    )
    .map((a) => ({
      prompt: a.question as string,
      answer: (a.answer as string).trim(),
      distractors: (a.options ?? []).map((o) => o.trim()).filter((o) => o !== (a.answer as string).trim()),
    }))
    .filter((r) => r.distractors.length > 0);
  if (!rounds.length) return null;
  return { type: "number-pop", title: "Pop the answer", rounds: rounds.slice(0, 8) };
}

function wordBuildFromVocabulary(vocabulary: string[], objective: string): GameSpec | null {
  const words = vocabulary
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && w.length <= 12 && !w.includes(" "))
    .map((w) => ({ word: w, hint: `A word from this story: ${objective}`.slice(0, 120) }));
  if (words.length < 3) return null;
  return { type: "word-build", title: "Build the word", words: words.slice(0, 6) };
}

function wordBuildFromFillBlanks(activities: Activity[]): GameSpec | null {
  // A fill_blank is already "which word completes this sentence" -- rebuilding that word
  // letter by letter is the same exercise with the spelling made explicit, which is
  // exactly the reading skill these lessons are for. This is also what gives derivation
  // reach: plenty of lessons have fill_blanks but no matching activity and no numeric
  // multiple-choice, and would otherwise end up with no game at all.
  const words = activities
    .filter(
      (a) =>
        a.type === "fill_blank" &&
        typeof a.answer === "string" &&
        typeof a.sentence === "string" &&
        !a.answer.trim().includes(" ") &&
        a.answer.trim().length >= 2 &&
        a.answer.trim().length <= 12
    )
    .map((a) => ({
      word: (a.answer as string).trim(),
      hint: (a.sentence as string).replace("___", "…").slice(0, 120),
    }));
  if (!words.length) return null;
  return { type: "word-build", title: "Build the missing word", words: words.slice(0, 6) };
}

export interface DeriveInput extends LessonData {
  /** Stories only -- feeds the Word Builder. */
  vocabulary?: string[];
}

export function deriveGames(input: DeriveInput): GameSpec[] {
  const content = Array.isArray(input.content) ? input.content : [];
  const activities = Array.isArray(input.activities) ? input.activities : [];

  const games = [
    pairMatchFromActivities(activities),
    pairMatchFromPictureBlocks(content),
    numberPopFromActivities(activities),
    // A story's own target words beat a sentence-derived guess, so vocabulary wins and
    // fill_blanks only fill in for content that has none (i.e. every lesson).
    input.vocabulary?.length
      ? wordBuildFromVocabulary(input.vocabulary, input.objective)
      : wordBuildFromFillBlanks(activities),
  ].filter((g): g is GameSpec => g !== null);

  // Round-trip through the parser so derived and authored games are held to exactly the
  // same shape rules -- a derivation bug can't sneak past the guards the model has to
  // satisfy.
  return parseGames(games);
}

// The single entry point callers should use: authored games if present, derived
// otherwise.
export function resolveGames(authored: unknown, input: DeriveInput): GameSpec[] {
  const parsed = parseGames(authored);
  if (parsed.length) return parsed;
  return deriveGames(input);
}
