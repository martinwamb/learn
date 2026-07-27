"use client";

import { useState } from "react";
import type { SortBinsGame } from "@/lib/games/types";
import { seededShuffle } from "@/lib/lesson/shuffle";
import type { GameCallbacks } from "./GameHost";

// Tap an item, then tap the basket it belongs in.
//
// Deliberately NOT HTML5 drag-and-drop -- the same decision the lesson player's
// matching question documents: native DnD behaves poorly on touchscreens, and this
// audience is entirely on shared phones.

export default function SortBins({ game, onCorrect, onWrong, onFinish }: { game: SortBinsGame } & GameCallbacks) {
  const [items] = useState(() => seededShuffle(game.items, Math.floor(Math.random() * 1_000_000)));
  const [placed, setPlaced] = useState<Record<string, string>>({}); // item label -> bin label
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [shakeBin, setShakeBin] = useState<string | null>(null);

  const remaining = items.filter((i) => placed[i.label] == null);

  const tapBin = (binLabel: string) => {
    if (!selected) return;
    const item = items.find((i) => i.label === selected);
    if (!item) return;

    if (item.bin !== binLabel) {
      onWrong();
      setShakeBin(binLabel);
      setTimeout(() => setShakeBin(null), 500);
      // Item stays selected so a wrong guess costs a tap, not a restart.
      return;
    }

    onCorrect();
    const nextCorrect = correctCount + 1;
    setCorrectCount(nextCorrect);
    setPlaced((p) => ({ ...p, [item.label]: binLabel }));
    setSelected(null);

    if (nextCorrect === items.length) onFinish(nextCorrect, items.length);
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-gray-400">
        {correctCount} of {items.length} sorted
      </p>

      {/* Items still to place */}
      <div className="min-h-[64px] flex flex-wrap justify-center gap-2">
        {remaining.map((item) => (
          <button
            key={item.label}
            onClick={() => setSelected((s) => (s === item.label ? null : item.label))}
            className={`px-4 py-3 rounded-2xl border-2 font-bold transition-all ${
              selected === item.label
                ? "bg-orange-200 border-orange-500 text-orange-900 scale-105"
                : "bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100 active:scale-95"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        {selected ? "Now tap the basket it belongs in 👇" : "Tap a word to pick it up 👆"}
      </p>

      {/* Bins */}
      <div className={`grid gap-2 ${game.bins.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {game.bins.map((bin) => {
          const contents = Object.entries(placed)
            .filter(([, b]) => b === bin.label)
            .map(([label]) => label);
          return (
            <button
              key={bin.label}
              onClick={() => tapBin(bin.label)}
              disabled={!selected}
              className={`min-h-[128px] rounded-2xl border-2 border-dashed p-2 flex flex-col items-center gap-1 transition-all ${
                shakeBin === bin.label
                  ? "bg-red-100 border-red-400"
                  : selected
                  ? "bg-green-50 border-green-400 hover:bg-green-100"
                  : "bg-gray-50 border-gray-300"
              }`}
            >
              <span className="text-2xl">{bin.icon ?? "🧺"}</span>
              <span className="font-bold text-sm text-gray-700 text-center leading-tight">{bin.label}</span>
              <div className="flex flex-wrap justify-center gap-1 mt-1">
                {contents.map((label) => (
                  <span key={label} className="text-xs bg-green-200 text-green-900 px-2 py-0.5 rounded-full">
                    {label}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
