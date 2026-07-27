// Runtime shape guards for the `games` Json column.
//
// Same defensive posture, and the same reason, as lib/lesson-validation.ts and the
// asStringItems/asPictureItems guards in lib/lesson/screens.ts: this data can come from
// a small local model, and in production those models have already been observed
// emitting objects where plain strings were asked for. A malformed game must be dropped
// at the boundary, never handed to a renderer.

import type { GameSpec, SortBinsGame, WordBuildGame } from "./types";

type WordEntry = WordBuildGame["words"][number];
type BinEntry = SortBinsGame["bins"][number];

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === "string" && x.trim() !== "");
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

// Returns a cleaned GameSpec, or null if the shape can't be salvaged.
export function parseGame(raw: unknown): GameSpec | null {
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Record<string, unknown>;
  const title = str(g.title) ?? undefined;

  switch (g.type) {
    case "pair-match": {
      if (!Array.isArray(g.pairs)) return null;
      const pairs = g.pairs
        .map((p) => {
          if (!p || typeof p !== "object") return null;
          const left = str((p as Record<string, unknown>).left);
          const right = str((p as Record<string, unknown>).right);
          return left && right ? { left, right } : null;
        })
        .filter((p): p is { left: string; right: string } => p !== null);
      // Two pairs is the minimum where matching is a game rather than a formality;
      // six keeps the grid to 12 cards, which fits a phone screen without scrolling.
      if (pairs.length < 2) return null;
      return { type: "pair-match", title, pairs: pairs.slice(0, 6) };
    }

    case "word-build": {
      if (!Array.isArray(g.words)) return null;
      const words = g.words
        .map((w): WordEntry | null => {
          if (!w || typeof w !== "object") return null;
          const rec = w as Record<string, unknown>;
          const word = str(rec.word);
          const hint = str(rec.hint);
          // Single letters can't be "built", and long words produce an unusable tile row.
          if (!word || !hint || word.length < 2 || word.length > 12) return null;
          return { word, hint, picture: str(rec.picture) ?? undefined };
        })
        .filter((w): w is WordEntry => w !== null);
      if (!words.length) return null;
      return { type: "word-build", title, words: words.slice(0, 6) };
    }

    case "sort-bins": {
      if (!Array.isArray(g.bins) || !Array.isArray(g.items)) return null;
      const bins = g.bins
        .map((b): BinEntry | null => {
          if (!b || typeof b !== "object") return null;
          const rec = b as Record<string, unknown>;
          const label = str(rec.label);
          return label ? { label, icon: str(rec.icon) ?? undefined } : null;
        })
        .filter((b): b is BinEntry => b !== null);
      if (bins.length < 2 || bins.length > 3) return null; // more than 3 bins doesn't fit a phone row
      const binLabels = new Set(bins.map((b) => b.label));
      const items = g.items
        .map((i) => {
          if (!i || typeof i !== "object") return null;
          const rec = i as Record<string, unknown>;
          const label = str(rec.label);
          const bin = str(rec.bin);
          // An item whose bin doesn't exist is unwinnable -- drop it rather than
          // shipping a game the child cannot complete.
          return label && bin && binLabels.has(bin) ? { label, bin } : null;
        })
        .filter((i): i is { label: string; bin: string } => i !== null);
      if (items.length < 3) return null;
      return { type: "sort-bins", title, bins, items: items.slice(0, 10) };
    }

    case "number-pop": {
      if (!Array.isArray(g.rounds)) return null;
      const rounds = g.rounds
        .map((r) => {
          if (!r || typeof r !== "object") return null;
          const rec = r as Record<string, unknown>;
          const prompt = str(rec.prompt);
          const answer = str(rec.answer);
          if (!prompt || !answer || !isStringArray(rec.distractors)) return null;
          const distractors = rec.distractors.filter((d) => d !== answer).slice(0, 3);
          if (!distractors.length) return null;
          return { prompt, answer, distractors };
        })
        .filter((r): r is { prompt: string; answer: string; distractors: string[] } => r !== null);
      if (!rounds.length) return null;
      return { type: "number-pop", title, rounds: rounds.slice(0, 8) };
    }

    default:
      return null;
  }
}

export function parseGames(raw: unknown): GameSpec[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseGame).filter((g): g is GameSpec => g !== null);
}

// For the generator workers: a human-readable reason a batch was rejected, mirroring
// validateLessonShape's contract (null means valid).
export function validateGamesShape(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null; // games are optional
  if (!Array.isArray(raw)) return "games is not an array";
  for (const g of raw) {
    if (!parseGame(g)) return `unusable game spec: ${JSON.stringify(g).slice(0, 200)}`;
  }
  return null;
}
