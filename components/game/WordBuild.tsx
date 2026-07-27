"use client";

import { useMemo, useState } from "react";
import type { WordBuildGame } from "@/lib/games/types";
import { seededShuffle } from "@/lib/lesson/shuffle";
import MediaImage from "@/components/lesson/MediaImage";
import type { GameCallbacks } from "./GameHost";

// Tap scrambled letter tiles in order to build the target word. This is the game that
// most directly serves "learn to read": the child hears the letter sound as they tap it,
// so building the word IS sounding it out.

export default function WordBuild({ game, onCorrect, onWrong, onFinish }: { game: WordBuildGame } & GameCallbacks) {
  const [wordIdx, setWordIdx] = useState(0);
  const [built, setBuilt] = useState<number[]>([]); // indices into `tiles`
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongTile, setWrongTile] = useState<number | null>(null);

  const current = game.words[wordIdx];

  // One random seed per round, drawn once in a lazy state initializer (the only place
  // randomness is allowed -- it runs outside render). Each word's scramble is then a
  // pure function of that seed and its index, so the tiles are stable across re-renders,
  // different for every word, and different again on a replay.
  const [roundSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const tiles = useMemo(
    () => seededShuffle(current.word.toUpperCase().split(""), roundSeed + wordIdx * 7919),
    [current.word, roundSeed, wordIdx]
  );

  const target = current.word.toUpperCase();
  const builtWord = built.map((i) => tiles[i]).join("");

  const speakLetter = (letter: string) => {
    // Letter NAME, not the raw character -- edge-tts reads a bare "B" as the letter
    // name anyway, but spelling it out keeps the request text stable and cacheable
    // across every word that contains that letter.
    fetch(`/api/tts/speak?text=${encodeURIComponent(`${letter}.`)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.url) new Audio(data.url).play().catch(() => {});
      })
      .catch(() => {});
  };

  const advance = (nextCorrect: number) => {
    if (wordIdx + 1 >= game.words.length) {
      onFinish(nextCorrect, game.words.length);
      return;
    }
    setWordIdx(wordIdx + 1);
    setBuilt([]);
  };

  const tapTile = (i: number) => {
    if (built.includes(i)) return;
    const letter = tiles[i];
    // Position-based check, so duplicate letters ("MOON") work: any tile bearing the
    // right letter for this position is accepted, not one specific tile.
    if (letter !== target[built.length]) {
      onWrong();
      setWrongTile(i);
      setTimeout(() => setWrongTile(null), 500);
      return;
    }

    speakLetter(letter);
    const next = [...built, i];
    setBuilt(next);

    if (next.length === target.length) {
      onCorrect();
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      // Pause on the finished word so the child sees it whole before it's replaced.
      setTimeout(() => advance(nextCorrect), 1100);
    }
  };

  const undo = () => setBuilt((b) => b.slice(0, -1));

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-gray-400">
        Word {wordIdx + 1} of {game.words.length}
      </p>

      {current.picture && <MediaImage query={current.picture} className="w-36 h-36 mx-auto" />}
      <p className="text-center text-lg text-gray-600">{current.hint}</p>

      {/* Answer slots */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {target.split("").map((_, i) => (
          <div
            key={i}
            className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${
              built[i] != null
                ? "bg-green-100 border-green-400 text-green-900"
                : "bg-gray-50 border-dashed border-gray-300"
            }`}
          >
            {built[i] != null ? tiles[built[i]] : ""}
          </div>
        ))}
      </div>

      {/* Letter tiles */}
      <div className="flex justify-center gap-2 flex-wrap">
        {tiles.map((letter, i) => {
          const used = built.includes(i);
          return (
            <button
              key={i}
              onClick={() => tapTile(i)}
              disabled={used}
              className={`w-14 h-14 rounded-2xl border-2 text-2xl font-bold transition-all ${
                used
                  ? "bg-gray-100 border-gray-200 text-gray-300"
                  : wrongTile === i
                  ? "bg-red-200 border-red-500 text-red-900"
                  : "bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200 active:scale-95"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {built.length > 0 && builtWord !== target && (
        <button onClick={undo} className="mx-auto block text-sm text-gray-500 underline">
          ← Take one back
        </button>
      )}
    </div>
  );
}
