"use client";

import { useState } from "react";
import type { PairMatchGame } from "@/lib/games/types";
import { seededShuffle } from "@/lib/lesson/shuffle";
import type { GameCallbacks } from "./GameHost";

// Classic memory game: all cards face down, flip two, keep them if they're a pair.
// Derives for free from any lesson that already has a `matching` activity or a
// picture-match block (lib/games/derive.ts), so it works on existing content.

interface Card {
  id: number;
  pairId: number;
  label: string;
}

export default function PairMatch({ game, onCorrect, onWrong, onFinish }: { game: PairMatchGame } & GameCallbacks) {
  // Lazy state initializer, not useMemo: the layout must be random per round but fixed
  // within it, and randomness during render would break React's purity rule (see the
  // note on seededShuffle). GameHost remounts this component for a replay, so a new
  // round genuinely reshuffles.
  const [cards] = useState<Card[]>(() => {
    const flat = game.pairs.flatMap((p, pairId) => [
      { id: pairId * 2, pairId, label: p.left },
      { id: pairId * 2 + 1, pairId, label: p.right },
    ]);
    return seededShuffle(flat, Math.floor(Math.random() * 1_000_000));
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  // Blocks input during the ~800ms a non-matching pair stays visible, so a fast tapper
  // can't flip a third card and desync the board.
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const tap = (card: Card) => {
    if (busy || matched.has(card.id) || flipped.includes(card.id)) return;

    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length < 2) return;

    setBusy(true);
    setAttempts((a) => a + 1);
    const [aId, bId] = next;
    const a = cards.find((c) => c.id === aId)!;
    const b = cards.find((c) => c.id === bId)!;

    if (a.pairId === b.pairId) {
      onCorrect();
      const nextMatched = new Set(matched).add(aId).add(bId);
      setMatched(nextMatched);
      setFlipped([]);
      setBusy(false);
      if (nextMatched.size === cards.length) {
        onFinish(game.pairs.length, game.pairs.length);
      }
    } else {
      onWrong();
      // Long enough for a 4-year-old to actually read both cards before they turn back.
      setTimeout(() => {
        setFlipped([]);
        setBusy(false);
      }, 900);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-gray-400">
        {matched.size / 2} of {game.pairs.length} pairs found · {attempts} tries
      </p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const isUp = flipped.includes(card.id) || matched.has(card.id);
          const isMatched = matched.has(card.id);
          return (
            <button
              key={card.id}
              onClick={() => tap(card)}
              disabled={isMatched}
              aria-label={isUp ? card.label : "Face-down card"}
              className={`h-24 rounded-2xl border-2 p-1 text-sm font-bold transition-all flex items-center justify-center text-center leading-tight ${
                isMatched
                  ? "bg-green-100 border-green-400 text-green-900"
                  : isUp
                  ? "bg-orange-100 border-orange-400 text-orange-900 scale-105"
                  : "bg-purple-500 border-purple-600 text-white hover:bg-purple-400 active:scale-95"
              }`}
            >
              {isUp ? card.label : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
