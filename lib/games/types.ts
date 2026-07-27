// Four data-driven game engines. Every game in the app is one of these shapes plus
// data -- there are no bespoke per-lesson games. That's what lets a game attach to any
// lesson or story (hand-authored via the `games` column, or derived from existing
// content by lib/games/derive.ts) without writing new components each time.
//
// All four are tap-only. No dragging, no typing, no dropdowns: the youngest audience
// here is four years old on a shared phone.

export type GameType = "pair-match" | "word-build" | "sort-bins" | "number-pop";

export interface PairMatchGame {
  type: "pair-match";
  title?: string;
  /** Rendered as a face-down grid of 2N cards; a left and its right are one match. */
  pairs: { left: string; right: string }[];
}

export interface WordBuildGame {
  type: "word-build";
  title?: string;
  words: {
    word: string;
    /** Read aloud and shown above the tiles, e.g. "A big grey animal". */
    hint: string;
    /** Optional picture query -- looked up through the same MediaImage/Iconscout path lessons use. */
    picture?: string;
  }[];
}

export interface SortBinsGame {
  type: "sort-bins";
  title?: string;
  bins: { label: string; icon?: string }[];
  /** `bin` must match one of `bins[].label` exactly. */
  items: { label: string; bin: string }[];
}

export interface NumberPopGame {
  type: "number-pop";
  title?: string;
  rounds: { prompt: string; answer: string; distractors: string[] }[];
}

export type GameSpec = PairMatchGame | WordBuildGame | SortBinsGame | NumberPopGame;

export const GAME_META: Record<GameType, { label: string; emoji: string; blurb: string }> = {
  "pair-match": { label: "Pair Match", emoji: "🃏", blurb: "Flip the cards and find the matching pairs" },
  "word-build": { label: "Word Builder", emoji: "🔤", blurb: "Tap the letters in order to build the word" },
  "sort-bins": { label: "Sort It Out", emoji: "🧺", blurb: "Put each thing in the basket where it belongs" },
  "number-pop": { label: "Number Pop", emoji: "🎈", blurb: "Pop the balloon with the right answer" },
};

// How many points a completed game is worth. Matches the lesson player's 10-per-correct
// scale so the dashboard total means one consistent thing.
export const POINTS_PER_CORRECT = 10;
