"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NumberPopGame } from "@/lib/games/types";
import { seededShuffle } from "@/lib/lesson/shuffle";
import type { GameCallbacks } from "./GameHost";

// Timed round: pop the balloon carrying the right answer before the timer runs out.
//
// The timer is deliberately generous and deliberately non-punishing -- running out
// just moves to the next round. Speed pressure that can make a 6-year-old feel they
// failed at arithmetic is the opposite of what this is for; the clock exists to build
// recall fluency, not to grade.

const SECONDS_PER_ROUND = 12;

export default function NumberPop({ game, onCorrect, onWrong, onFinish }: { game: NumberPopGame } & GameCallbacks) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_ROUND);

  const round = game.rounds[roundIdx];

  // One random seed per round, drawn once outside render (see the same note in
  // WordBuild) -- each round's balloon order is then a pure function of it.
  const [roundSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const options = useMemo(
    () => seededShuffle([round.answer, ...round.distractors], roundSeed + roundIdx * 7919),
    [round, roundSeed, roundIdx]
  );

  const advance = useCallback(
    (nextCorrect: number) => {
      if (roundIdx + 1 >= game.rounds.length) {
        onFinish(nextCorrect, game.rounds.length);
        return;
      }
      setRoundIdx(roundIdx + 1);
      setPicked(null);
      setSecondsLeft(SECONDS_PER_ROUND);
    },
    [roundIdx, game.rounds.length, onFinish]
  );

  // Countdown. Pauses once an answer is picked so the feedback pause isn't also racing
  // the clock. Every state change happens inside the timeout callback rather than in
  // the effect body -- a synchronous setState here would cascade a render per tick.
  useEffect(() => {
    if (picked !== null) return;
    const t = setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft((s) => s - 1);
        return;
      }
      setSecondsLeft(0);
      setPicked(""); // empty string = timed out, distinct from "not answered yet"
      onWrong();
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, picked]);

  // Moving on after a timeout is its own effect so the countdown above stays a pure
  // timer. Only fires for the timeout case; a tapped answer advances from pop().
  useEffect(() => {
    if (picked !== "") return;
    const t = setTimeout(() => advance(correctCount), 1200);
    return () => clearTimeout(t);
  }, [picked, advance, correctCount]);

  const pop = (opt: string) => {
    if (picked !== null) return;
    setPicked(opt);
    const isRight = opt === round.answer;
    const nextCorrect = isRight ? correctCount + 1 : correctCount;
    if (isRight) {
      onCorrect();
      setCorrectCount(nextCorrect);
    } else {
      onWrong();
    }
    setTimeout(() => advance(nextCorrect), 1200);
  };

  const lowTime = secondsLeft <= 4 && picked === null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Round {roundIdx + 1} of {game.rounds.length}
        </span>
        <span className={lowTime ? "text-red-500 font-bold" : ""}>⏱ {Math.max(secondsLeft, 0)}s</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
        <p className="text-2xl font-bold text-gray-800">{round.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isAnswer = opt === round.answer;
          const isPicked = picked === opt;
          const revealed = picked !== null;
          return (
            <button
              key={opt}
              onClick={() => pop(opt)}
              disabled={revealed}
              className={`h-24 rounded-full border-2 text-2xl font-bold transition-all ${
                revealed && isAnswer
                  ? "bg-green-200 border-green-500 text-green-900 scale-105"
                  : isPicked
                  ? "bg-red-100 border-red-400 text-red-900"
                  : revealed
                  ? "bg-gray-50 border-gray-200 text-gray-400"
                  : "bg-pink-100 border-pink-400 text-pink-900 hover:bg-pink-200 active:scale-95"
              }`}
            >
              🎈 {opt}
            </button>
          );
        })}
      </div>

      {picked === "" && <p className="text-center text-gray-500">Time&rsquo;s up! The answer was {round.answer}.</p>}
    </div>
  );
}
