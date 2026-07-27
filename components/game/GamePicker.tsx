"use client";

import { useState } from "react";
import { GAME_META, type GameSpec, type GameType } from "@/lib/games/types";
import GameHost from "./GameHost";

export interface GameEntry {
  game: GameSpec;
  sourceKind: "lesson" | "religious-lesson" | "story";
  sourceId: string;
  sourceTitle: string;
  subjectName: string;
  subjectIcon: string;
}

const FILTERS: { key: GameType | "all"; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "🎮" },
  { key: "pair-match", label: GAME_META["pair-match"].label, emoji: GAME_META["pair-match"].emoji },
  { key: "word-build", label: GAME_META["word-build"].label, emoji: GAME_META["word-build"].emoji },
  { key: "sort-bins", label: GAME_META["sort-bins"].label, emoji: GAME_META["sort-bins"].emoji },
  { key: "number-pop", label: GAME_META["number-pop"].label, emoji: GAME_META["number-pop"].emoji },
];

export default function GamePicker({ entries }: { entries: GameEntry[] }) {
  const [filter, setFilter] = useState<GameType | "all">("all");
  const [active, setActive] = useState<GameEntry | null>(null);

  if (active) {
    return (
      <div>
        <button onClick={() => setActive(null)} className="text-orange-500 hover:underline text-sm mb-2">
          ← All games
        </button>
        <p className="text-xs text-gray-400 mb-2">
          From: {active.sourceTitle} ({active.subjectName})
        </p>
        <GameHost
          game={active.game}
          sourceKind={active.sourceKind}
          sourceId={active.sourceId}
          onExit={() => setActive(null)}
        />
      </div>
    );
  }

  const available = new Set(entries.map((e) => e.game.type));
  const shown = filter === "all" ? entries : entries.filter((e) => e.game.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {/* Only offer a filter that would actually return something -- an empty result
            from a chip the child just tapped reads as the app being broken. */}
        {FILTERS.filter((f) => f.key === "all" || available.has(f.key)).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
              filter === f.key
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shown.map((entry, i) => {
          const meta = GAME_META[entry.game.type];
          return (
            <button
              key={`${entry.sourceId}-${entry.game.type}-${i}`}
              onClick={() => setActive(entry)}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 active:scale-95 transition-all text-left shadow-sm"
            >
              <span className="text-3xl">{meta.emoji}</span>
              <div className="min-w-0">
                <div className="font-bold text-gray-800 truncate">{entry.game.title ?? meta.label}</div>
                <div className="text-xs text-gray-400 truncate">
                  {entry.subjectIcon} {entry.sourceTitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
