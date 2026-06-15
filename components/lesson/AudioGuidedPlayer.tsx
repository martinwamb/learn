"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLessonNarrator } from "@/hooks/useLessonNarrator";
import type { Activity } from "@/hooks/useLessonNarrator";

interface Props {
  lesson: {
    id: string;
    title: string;
    objective: string;
    content: unknown[];
    activities: unknown[];
    funFact?: string | null;
    duration: number;
  };
  gradeCode: string;
  subjectSlug: string;
}

// Which animation clip to show per narrator phase
function clipForPhase(phase: string, feedback: "correct" | "wrong" | null): string {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "celebrate";
  if (phase === "feedback") return feedback === "correct" ? "correct" : "wrong";
  if (phase === "waiting-answer") return "thinking";
  return "talking";
}

const OPTION_STYLES = [
  "bg-red-100 border-red-400 text-red-900 hover:bg-red-200 active:bg-red-300",
  "bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200 active:bg-blue-300",
  "bg-green-100 border-green-400 text-green-900 hover:bg-green-200 active:bg-green-300",
  "bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200 active:bg-yellow-300",
];
const OPTION_EMOJIS = ["🔴", "🔵", "🟢", "🟡"];

export default function AudioGuidedPlayer({ lesson, gradeCode, subjectSlug }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [matchMap, setMatchMap] = useState<Record<string, string>>({});
  const [fillValue, setFillValue] = useState("");

  const narrator = useLessonNarrator({
    title: lesson.title,
    objective: lesson.objective,
    content: lesson.content as never,
    activities: lesson.activities as never,
    funFact: lesson.funFact,
  });

  const clip = clipForPhase(narrator.phase, narrator.feedback);

  // Swap video src when clip changes
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const webm = `/animations/${clip}.webm`;
    const mp4 = `/animations/${clip}.mp4`;
    // try webm first, fall back to mp4
    vid.src = webm;
    vid.load();
    vid.play().catch(() => {
      vid.src = mp4;
      vid.load();
      vid.play().catch(() => {});
    });
  }, [clip]);

  const handleStart = useCallback(() => {
    setStarted(true);
    narrator.start((score) => {
      setFinalScore(score);
      saveProgress(lesson.id, score);
    });
  }, [narrator, lesson.id]);

  async function saveProgress(lessonId: string, score: number) {
    try {
      await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, score }),
      });
    } catch { /* non-fatal */ }
  }

  const handleOptionTap = useCallback(
    (opt: string) => {
      if (narrator.phase !== "waiting-answer") return;
      setSelectedOpt(opt);
      narrator.submitAnswer(opt);
    },
    [narrator]
  );

  const handleFillSubmit = useCallback(() => {
    if (!fillValue.trim()) return;
    narrator.submitAnswer(fillValue.trim());
    setFillValue("");
  }, [fillValue, narrator]);

  const handleMatchSubmit = useCallback(() => {
    const act = narrator.currentActivity as Activity | null;
    if (!act || act.type !== "matching") return;
    const allMatched = (act.pairs ?? []).every(
      (p) => matchMap[p.left] === p.right
    );
    narrator.submitAnswer(allMatched ? "__all_matched__" : "__wrong__");
    setMatchMap({});
  }, [narrator, matchMap]);

  // reset selection state when activity changes
  useEffect(() => {
    setSelectedOpt(null);
    setFillValue("");
    setMatchMap({});
  }, [narrator.actIdx]);

  const currentAct = narrator.currentActivity as Activity | null;
  const isWaiting = narrator.phase === "waiting-answer";
  const isAsking = narrator.phase === "asking" || isWaiting;

  // ── Completion screen ──────────────────────────────────────────────────────
  if (narrator.phase === "complete") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-6">
        <video
          ref={videoRef}
          className="w-52 h-52 rounded-full object-cover shadow-xl border-4 border-yellow-300"
          autoPlay
          playsInline
          muted={false}
          loop={false}
        />
        <div className="text-center space-y-2">
          <div className="text-5xl">🏆</div>
          <h2 className="text-3xl font-bold text-gray-800">Lesson Complete!</h2>
          <p className="text-xl text-gray-500">You scored {finalScore || narrator.score} stars ⭐</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl text-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => router.push("/library")}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-8 rounded-2xl text-lg transition-colors"
          >
            Read a Story 📖
          </button>
        </div>
      </div>
    );
  }

  // ── Start screen ──────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-8">
        <video
          ref={videoRef}
          src="/animations/idle.webm"
          className="w-52 h-52 rounded-full object-cover shadow-xl border-4 border-yellow-300"
          autoPlay
          playsInline
          muted
          loop
        />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
          <p className="text-gray-500 text-lg">with Jina the Giraffe 🦒</p>
        </div>
        <button
          onClick={handleStart}
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-5 px-14 rounded-3xl text-2xl shadow-lg transition-all transform hover:scale-105"
        >
          ▶ Start Lesson
        </button>
        <p className="text-sm text-gray-400 text-center max-w-xs">
          Listen carefully and tap your answer when Jina asks a question!
        </p>
      </div>
    );
  }

  // ── Active lesson ─────────────────────────────────────────────────────────
  const totalActs = (lesson.activities as unknown[]).length;

  return (
    <div className="flex flex-col items-center px-2 py-4 space-y-4 min-h-[80vh]">
      {/* Progress dots */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length: totalActs }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < narrator.actIdx
                ? "bg-green-500"
                : i === narrator.actIdx && isAsking
                ? "bg-orange-400 scale-125"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Mascot video */}
      <video
        ref={videoRef}
        className={`w-48 h-48 rounded-full object-cover shadow-lg border-4 transition-all ${
          narrator.feedback === "correct"
            ? "border-green-400 shadow-green-200"
            : narrator.feedback === "wrong"
            ? "border-red-300 shadow-red-100"
            : "border-yellow-300"
        }`}
        autoPlay
        playsInline
        loop={clip === "idle" || clip === "talking" || clip === "thinking"}
      />

      {/* Spoken text card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-4 min-h-[72px] flex items-center justify-center">
        <p className="text-lg text-gray-700 text-center leading-snug font-medium">
          {narrator.currentText || lesson.title}
        </p>
      </div>

      {/* Feedback banner */}
      {narrator.feedback && (
        <div
          className={`w-full max-w-md rounded-2xl py-3 px-5 text-center font-bold text-xl ${
            narrator.feedback === "correct"
              ? "bg-green-100 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {narrator.feedback === "correct" ? "Correct! Well done! 🎉" : "Good try! 💪"}
        </div>
      )}

      {/* Activity UI — shown during asking + waiting */}
      {isAsking && currentAct && (
        <div className="w-full max-w-md space-y-3">
          {/* multiple_choice */}
          {currentAct.type === "multiple_choice" && (
            <div className="grid grid-cols-2 gap-3">
              {(currentAct.options ?? []).map((opt, i) => (
                <button
                  key={opt}
                  disabled={!!narrator.feedback}
                  onClick={() => handleOptionTap(opt)}
                  className={`h-16 rounded-2xl border-2 font-bold text-base transition-all flex items-center justify-center gap-2 ${
                    selectedOpt === opt
                      ? narrator.feedback === "correct"
                        ? "bg-green-200 border-green-500 text-green-900 scale-105"
                        : narrator.feedback === "wrong"
                        ? "bg-red-100 border-red-400 text-red-900"
                        : "bg-orange-100 border-orange-400 scale-105"
                      : OPTION_STYLES[i % OPTION_STYLES.length]
                  } border-2`}
                >
                  <span>{OPTION_EMOJIS[i % OPTION_EMOJIS.length]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          )}

          {/* fill_blank */}
          {currentAct.type === "fill_blank" && (
            <div className="space-y-3">
              <input
                type="text"
                value={fillValue}
                onChange={(e) => setFillValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFillSubmit()}
                disabled={!!narrator.feedback}
                placeholder="Type your answer..."
                className="w-full border-2 border-gray-200 rounded-2xl p-4 text-xl focus:border-orange-400 focus:outline-none"
              />
              {!narrator.feedback && (
                <button
                  onClick={handleFillSubmit}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-lg"
                >
                  Check ✓
                </button>
              )}
            </div>
          )}

          {/* matching */}
          {currentAct.type === "matching" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {(currentAct.pairs ?? []).map((p) => (
                    <div
                      key={p.left}
                      className="h-12 bg-blue-100 rounded-xl flex items-center justify-center font-semibold text-blue-800"
                    >
                      {p.left}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {(currentAct.pairs ?? []).map((p) => (
                    <select
                      key={p.right}
                      value={matchMap[p.left] ?? ""}
                      onChange={(e) =>
                        setMatchMap((m) => ({ ...m, [p.left]: e.target.value }))
                      }
                      disabled={!!narrator.feedback}
                      className="w-full h-12 border-2 border-gray-200 rounded-xl px-2 text-sm focus:border-orange-400 focus:outline-none"
                    >
                      <option value="">Pick...</option>
                      {(currentAct.pairs ?? []).map((pp) => (
                        <option key={pp.right} value={pp.right}>{pp.right}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
              {!narrator.feedback && (
                <button
                  onClick={handleMatchSubmit}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-lg"
                >
                  Check Matches ✓
                </button>
              )}
            </div>
          )}

          {/* Voice mic button */}
          {currentAct.type === "multiple_choice" && isWaiting && !narrator.feedback && (
            <button
              onPointerDown={() => narrator.startListening(currentAct.options ?? [])}
              onPointerUp={() => narrator.stopListening()}
              className={`w-full h-12 rounded-2xl border-2 font-semibold text-sm transition-all ${
                narrator.isListening
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {narrator.isListening ? "🎤 Listening..." : "🎤 Hold to speak your answer"}
            </button>
          )}
        </div>
      )}

      {/* Stop button */}
      <button
        onClick={() => { narrator.stop(); router.back(); }}
        className="mt-auto text-sm text-gray-400 hover:text-gray-600 underline"
      >
        Exit lesson
      </button>
    </div>
  );
}
