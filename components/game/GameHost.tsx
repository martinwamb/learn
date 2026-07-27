"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameSpec } from "@/lib/games/types";
import { GAME_META, POINTS_PER_CORRECT } from "@/lib/games/types";
import PairMatch from "./PairMatch";
import WordBuild from "./WordBuild";
import SortBins from "./SortBins";
import NumberPop from "./NumberPop";

// Shared chrome for all four engines: mascot, score, sound effects, replay and the
// single completion POST. Each engine only reports "that was right/wrong" and "I'm
// done" -- none of them knows about scoring, audio or persistence.

export interface GameCallbacks {
  onCorrect: () => void;
  onWrong: () => void;
  onFinish: (correct: number, total: number) => void;
}

interface Props {
  game: GameSpec;
  /** Which piece of content this game belongs to, for progress attribution. */
  sourceKind: "lesson" | "religious-lesson" | "story";
  sourceId: string;
  onExit?: () => void;
}

export default function GameHost({ game, sourceKind, sourceId, onExit }: Props) {
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<{ correct: number; total: number } | null>(null);
  const [round, setRound] = useState(0); // bumping this remounts the engine for a replay
  const [muted, setMuted] = useState(false);
  const sfxRef = useRef<Record<string, HTMLAudioElement>>({});
  const savedRef = useRef(false);
  const meta = GAME_META[game.type];

  useEffect(() => {
    // Same static clips the lesson player uses -- already on disk, already cached by
    // nginx with a 1-year immutable header.
    const names = ["correct", "wrong", "celebrate"];
    const map: Record<string, HTMLAudioElement> = {};
    for (const name of names) {
      const audio = new Audio(`/audio/sfx/${name}.mp3`);
      audio.preload = "auto";
      map[name] = audio;
    }
    sfxRef.current = map;
    return () => {
      for (const audio of Object.values(map)) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const play = useCallback((name: string) => {
    if (muted) return;
    const audio = sfxRef.current[name];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {}); // autoplay policy can refuse before first interaction
  }, [muted]);

  const onCorrect = useCallback(() => {
    setScore((s) => s + POINTS_PER_CORRECT);
    play("correct");
  }, [play]);

  const onWrong = useCallback(() => play("wrong"), [play]);

  const onFinish = useCallback(
    (correct: number, total: number) => {
      setDone({ correct, total });
      play("celebrate");
      // Guard against a double POST if an engine reports completion twice (e.g. a final
      // tap that both completes the last round and triggers the finish check).
      if (savedRef.current) return;
      savedRef.current = true;
      fetch("/api/games/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind,
          sourceId,
          gameType: game.type,
          score: correct * POINTS_PER_CORRECT,
        }),
      }).catch(() => {}); // points are a nice-to-have; never block the celebration on it
    },
    [game.type, play, sourceKind, sourceId]
  );

  const replay = () => {
    setDone(null);
    setScore(0);
    savedRef.current = false;
    setRound((r) => r + 1);
  };

  const callbacks: GameCallbacks = { onCorrect, onWrong, onFinish };

  return (
    <div className="flex flex-col items-center px-2 py-4 space-y-4">
      <div className="w-full max-w-md flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">
            {meta.emoji} {game.title ?? meta.label}
          </h2>
          <p className="text-xs text-gray-400">{meta.blurb}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-orange-600">⭐ {score}</span>
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="text-xl">
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {done ? (
        <div className="w-full max-w-md flex flex-col items-center space-y-4 py-6">
          <video
            className="w-40 h-40 rounded-full object-cover border-4 border-yellow-300 shadow-lg"
            src="/animations/celebrate.mp4"
            autoPlay
            playsInline
          />
          <p className="text-2xl font-bold text-gray-800">
            {done.correct} out of {done.total}!
          </p>
          <p className="text-gray-500">You earned {done.correct * POINTS_PER_CORRECT} stars ⭐</p>
          <div className="flex gap-3">
            <button
              onClick={replay}
              className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow"
            >
              Play again 🔁
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-2xl text-lg"
              >
                Done
              </button>
            )}
          </div>
        </div>
      ) : (
        <div key={round} className="w-full max-w-md">
          {game.type === "pair-match" && <PairMatch game={game} {...callbacks} />}
          {game.type === "word-build" && <WordBuild game={game} {...callbacks} />}
          {game.type === "sort-bins" && <SortBins game={game} {...callbacks} />}
          {game.type === "number-pop" && <NumberPop game={game} {...callbacks} />}
        </div>
      )}
    </div>
  );
}
