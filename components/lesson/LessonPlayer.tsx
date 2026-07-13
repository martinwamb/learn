"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLessonPlayer } from "@/hooks/useLessonPlayer";
import type { Activity, QuestionStatus, Screen } from "@/hooks/useLessonPlayer";
import MediaImage from "@/components/lesson/MediaImage";
import { seededShuffle } from "@/lib/lesson/shuffle";

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

const OPTION_STYLES = [
  "bg-red-100 border-red-400 text-red-900 hover:bg-red-200 active:bg-red-300",
  "bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200 active:bg-blue-300",
  "bg-green-100 border-green-400 text-green-900 hover:bg-green-200 active:bg-green-300",
  "bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200 active:bg-yellow-300",
];
const OPTION_EMOJIS = ["🔴", "🔵", "🟢", "🟡"];

// Which animation clip to show for the current screen/question sub-state.
function clipForScreen(
  screen: Screen,
  questionStatus: QuestionStatus,
  answer: { correct: boolean } | undefined,
  audioMode: boolean
): string {
  if (screen.kind === "welcome") return "idle";
  if (screen.kind === "complete") return "celebrate";
  if (screen.kind === "question") {
    if (answer) return answer.correct ? "correct" : "wrong";
    if (questionStatus === "waiting") return "thinking";
    return "talking";
  }
  return audioMode ? "talking" : "idle";
}

function isAnswerReady(
  act: Activity,
  selectedOpt: string | null,
  fillValue: string,
  matchMap: Record<string, string>
): boolean {
  if (act.type === "multiple_choice") return selectedOpt != null;
  if (act.type === "fill_blank") return fillValue.trim() !== "";
  if (act.type === "matching") return (act.pairs ?? []).every((p) => matchMap[p.left] != null);
  if (act.type === "reflection") return true;
  return false;
}

export default function LessonPlayer({ lesson, gradeCode }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [matchMap, setMatchMap] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<Record<string, HTMLAudioElement>>({});
  const itemSoundRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const bg = new Audio("/audio/sfx/bg-music.mp3");
    bg.loop = true;
    bg.volume = 0.12;
    bgMusicRef.current = bg;
    sfxRef.current = {
      correct: new Audio("/audio/sfx/correct.mp3"),
      wrong: new Audio("/audio/sfx/wrong.mp3"),
      celebrate: new Audio("/audio/sfx/celebrate.mp3"),
      question: new Audio("/audio/sfx/question.mp3"),
    };
    return () => {
      bg.pause();
      Object.values(sfxRef.current).forEach((a) => a.pause());
    };
  }, []);

  useEffect(() => {
    mutedRef.current = muted;
    if (bgMusicRef.current) bgMusicRef.current.muted = muted;
    Object.values(sfxRef.current).forEach((a) => {
      a.muted = muted;
    });
    if (itemSoundRef.current) itemSoundRef.current.muted = muted;
  }, [muted]);

  // Plays correct/wrong SFX for both the tap path and the mic path uniformly (see
  // hooks/useLessonPlayer.ts) -- excludes "reflection" activities, which have no
  // right/wrong.
  const handleAnswered = useCallback((correct: boolean) => {
    (correct ? sfxRef.current.correct : sfxRef.current.wrong)?.play().catch(() => {});
  }, []);

  const lessonData = useMemo(
    () => ({
      title: lesson.title,
      objective: lesson.objective,
      content: lesson.content as never,
      activities: lesson.activities as never,
      funFact: lesson.funFact,
    }),
    [lesson.title, lesson.objective, lesson.content, lesson.activities, lesson.funFact]
  );

  const player = useLessonPlayer(
    lessonData,
    gradeCode === "PP1" || gradeCode === "PP2",
    handleAnswered
  );

  const screen = player.screen;
  const currentAct: Activity | null = screen.kind === "question" ? (lesson.activities as Activity[])[screen.actIdx] : null;

  const clip = clipForScreen(screen, player.questionStatus, player.answer, player.audioMode);

  // Swap video src when clip changes
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.src = `/animations/${clip}.mp4`;
    vid.load();
    vid.play().catch(() => {});
  }, [clip]);

  // BG music: plays through the lesson body, stops on the welcome/complete bookends
  useEffect(() => {
    const bg = bgMusicRef.current;
    if (!bg) return;
    if (screen.kind !== "welcome" && screen.kind !== "complete") {
      bg.play().catch(() => {});
    } else {
      bg.pause();
      bg.currentTime = 0;
    }
  }, [screen.kind]);

  // Question/celebrate SFX once per screen entry (not on every re-render at the same
  // screen -- e.g. while composing an answer)
  const prevScreenIdxRef = useRef(-1);
  useEffect(() => {
    if (prevScreenIdxRef.current === player.screenIdx) return;
    prevScreenIdxRef.current = player.screenIdx;
    if (screen.kind === "question" && !player.answer) {
      sfxRef.current.question?.play().catch(() => {});
    } else if (screen.kind === "complete") {
      sfxRef.current.celebrate?.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.screenIdx]);

  const playItemSound = useCallback((query: string) => {
    itemSoundRef.current?.pause();
    fetch(`/api/media/sound?query=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(({ url }: { url: string }) => {
        const audio = new Audio(url);
        audio.muted = mutedRef.current;
        itemSoundRef.current = audio;
        audio.play().catch(() => {});
      })
      .catch(() => {});
  }, []);

  // Auto-play the sound for a picture-match item screen as soon as it's shown
  // (only when that item actually has a sound -- e.g. colors have none). Searches
  // by `label` (the concrete noun, e.g. "Drum"), not the onomatopoeia text in
  // `sound` -- Freesound has real drum sounds tagged "drum", not "boom boom".
  useEffect(() => {
    if (screen.kind === "picture-item" && screen.sound) {
      playItemSound(screen.label);
    } else {
      itemSoundRef.current?.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.screenIdx]);

  // Completion save -- guarded so navigating back-and-forward across the complete
  // screen can't double-increment totalPoints server-side (POST is non-idempotent).
  useEffect(() => {
    if (screen.kind !== "complete" || hasSavedRef.current) return;
    hasSavedRef.current = true;
    fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, score: player.score }),
    }).catch(() => {});
  }, [screen.kind, lesson.id, player.score]);

  // Reset in-progress answer composition when the screen changes -- render-time
  // state adjustment (not an effect): this is a synchronous derivation from
  // screenIdx, and synchronous setState calls directly in an effect body are
  // disallowed by this project's lint config outside an async callback. Uses state
  // (not a ref) for the "last seen" comparison -- refs can't be read/written during
  // render under this project's lint config either.
  const [lastComposingScreenIdx, setLastComposingScreenIdx] = useState(-1);
  if (lastComposingScreenIdx !== player.screenIdx) {
    setLastComposingScreenIdx(player.screenIdx);
    setSelectedOpt(null);
    setFillValue("");
    setMatchMap({});
    setSelectedLeft(null);
  }

  const handleCheck = useCallback(() => {
    if (!currentAct) return;
    if (currentAct.type === "multiple_choice") player.checkAnswer(selectedOpt ?? "");
    else if (currentAct.type === "fill_blank") player.checkAnswer(fillValue.trim());
    else if (currentAct.type === "matching") {
      const allMatched = (currentAct.pairs ?? []).every((p) => matchMap[p.left] === p.right);
      player.checkAnswer(allMatched ? "__all_matched__" : "__wrong__");
    } else if (currentAct.type === "reflection") player.checkAnswer("reflected");
  }, [currentAct, selectedOpt, fillValue, matchMap, player]);

  // Tap-to-connect matching: tap a left item, then tap its right pair (no native
  // HTML5 drag-and-drop, which behaves poorly on touchscreens).
  const handleLeftTap = useCallback(
    (left: string) => {
      if (player.answer) return;
      if (matchMap[left] != null) {
        setMatchMap((m) => {
          const next = { ...m };
          delete next[left];
          return next;
        });
        setSelectedLeft(null);
        return;
      }
      setSelectedLeft((cur) => (cur === left ? null : left));
    },
    [player.answer, matchMap]
  );

  const handleRightTap = useCallback(
    (right: string) => {
      if (player.answer || !selectedLeft) return;
      setMatchMap((m) => ({ ...m, [selectedLeft]: right }));
      setSelectedLeft(null);
    },
    [player.answer, selectedLeft]
  );

  // Deterministic (seeded) shuffle so the right column never trivially lines up with
  // the left column by position.
  const shuffledRights = useMemo(() => {
    if (!currentAct || currentAct.type !== "matching") return [];
    const rights = (currentAct.pairs ?? []).map((p) => p.right);
    return seededShuffle(rights, player.screenIdx * 2654435761 + rights.length + 1);
  }, [currentAct, player.screenIdx]);

  const canInteract = !player.answer && player.questionStatus === "waiting";
  const totalQuestions = (lesson.activities as unknown[]).length;

  return (
    <div className="flex flex-col items-center px-2 py-4 space-y-4 min-h-[80vh]">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between text-sm text-gray-400">
        <span>
          {screen.kind === "welcome"
            ? lesson.title
            : screen.kind === "question"
            ? `Question ${screen.actIdx + 1} of ${totalQuestions}`
            : `${player.screenIdx} / ${player.screens.length - 1}`}
        </span>
        <div className="flex gap-3 text-xl">
          <button
            onClick={() => player.setAudioMode((m) => !m)}
            aria-label={player.audioMode ? "Turn off narration" : "Turn on narration"}
            title={player.audioMode ? "Narration on" : "Narration off"}
          >
            {player.audioMode ? "🗣️" : "📖"}
          </button>
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Mascot */}
      <video
        ref={videoRef}
        className={`w-48 h-48 rounded-full object-cover shadow-lg border-4 transition-all ${
          player.answer?.correct
            ? "border-green-400 shadow-green-200"
            : player.answer && !player.answer.correct
            ? "border-red-300 shadow-red-100"
            : "border-yellow-300"
        }`}
        autoPlay
        playsInline
        muted={screen.kind === "welcome"}
        loop={clip === "idle" || clip === "talking" || clip === "thinking"}
      />

      {/* ── welcome ──────────────────────────────────────────────────────────── */}
      {screen.kind === "welcome" && (
        <div className="flex flex-col items-center text-center space-y-6 max-w-md">
          <p className="text-gray-500 text-lg">{lesson.objective}</p>
          <button
            onClick={player.next}
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-5 px-14 rounded-3xl text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            ▶ Start Lesson
          </button>
        </div>
      )}

      {/* ── content / funfact ────────────────────────────────────────────────── */}
      {(screen.kind === "content" || screen.kind === "funfact") && (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-4 min-h-[72px] flex items-center justify-center">
          <p className="text-xl text-gray-700 text-center leading-snug font-medium whitespace-pre-line">
            {screen.kind === "funfact" ? `Fun fact: ${screen.text}` : screen.text}
          </p>
        </div>
      )}

      {/* ── memory-verse (Faith Stories) ─────────────────────────────────────── */}
      {screen.kind === "memory-verse" && (
        <div className="w-full max-w-md bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-5 text-center space-y-2">
          <p className="text-xl text-gray-800 italic leading-snug">&ldquo;{screen.text}&rdquo;</p>
          <p className="text-sm text-yellow-700 font-semibold">— {screen.reference}</p>
        </div>
      )}

      {/* ── item (single short list entry, plain text -- never a picture target) ── */}
      {screen.kind === "item" && (
        <div className="w-full max-w-md flex flex-col items-center space-y-3">
          {screen.instruction && <p className="text-gray-500 text-base text-center">{screen.instruction}</p>}
          <p className="text-xl text-gray-700 text-center font-medium">{screen.item}</p>
        </div>
      )}

      {/* ── item-group (long lists grouped into one screen, plain text) ──────────── */}
      {screen.kind === "item-group" && (
        <div className="w-full max-w-md space-y-3">
          <p className="font-semibold text-gray-700 text-lg text-center">{screen.instruction}</p>
          <ul className="space-y-1">
            {screen.items.map((item, i) => (
              <li key={i} className="text-gray-600 text-base pl-4 border-l-2 border-orange-200">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── picture-item (always shows a picture; sound is optional per item) ────── */}
      {screen.kind === "picture-item" && (
        <div className="w-full max-w-md flex flex-col items-center space-y-3">
          {screen.instruction && <p className="text-gray-500 text-base text-center">{screen.instruction}</p>}
          <MediaImage query={screen.label} className="w-40 h-40" />
          <div className="text-center">
            <p className="text-xl text-gray-700 font-medium">{screen.label}</p>
            {screen.sound && <p className="text-sm text-gray-400 italic">{screen.sound}</p>}
          </div>
        </div>
      )}

      {/* ── question ──────────────────────────────────────────────────────────── */}
      {screen.kind === "question" && currentAct && (
        <div className="w-full max-w-md space-y-4">
          {currentAct.image && <MediaImage query={currentAct.image} className="w-40 h-40 mx-auto" />}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xl font-semibold text-gray-800">
              {currentAct.type === "multiple_choice" && currentAct.question}
              {currentAct.type === "fill_blank" && (currentAct.sentence ?? "").replace("___", "________")}
              {currentAct.type === "matching" && "Match the items:"}
              {currentAct.type === "reflection" && currentAct.prompt}
            </p>
          </div>

          {currentAct.type === "multiple_choice" && (
            <div className="grid grid-cols-2 gap-3">
              {(currentAct.options ?? []).map((opt, i) => {
                const isChosen = player.answer ? player.answer.given === opt : selectedOpt === opt;
                return (
                  <button
                    key={opt}
                    disabled={!canInteract}
                    onClick={() => setSelectedOpt(opt)}
                    className={`h-16 rounded-2xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      isChosen
                        ? player.answer
                          ? player.answer.correct
                            ? "bg-green-200 border-green-500 text-green-900 scale-105"
                            : "bg-red-100 border-red-400 text-red-900"
                          : "bg-orange-100 border-orange-400 scale-105"
                        : OPTION_STYLES[i % OPTION_STYLES.length]
                    }`}
                  >
                    <span>{OPTION_EMOJIS[i % OPTION_EMOJIS.length]}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentAct.type === "fill_blank" && (
            <input
              type="text"
              value={player.answer ? player.answer.given : fillValue}
              onChange={(e) => canInteract && setFillValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canInteract && isAnswerReady(currentAct, selectedOpt, fillValue, matchMap) && handleCheck()}
              disabled={!canInteract}
              placeholder="Type your answer..."
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-xl focus:border-orange-400 focus:outline-none disabled:bg-gray-50"
            />
          )}

          {currentAct.type === "matching" &&
            (player.answer ? (
              <div className="space-y-2">
                {(currentAct.pairs ?? []).map((p) => (
                  <div
                    key={p.left}
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3"
                  >
                    <span className="font-semibold text-green-800">{p.left}</span>
                    <span className="text-green-600">→</span>
                    <span className="font-semibold text-green-800">{p.right}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-400">
                  {selectedLeft ? "Now tap its match →" : "Tap an item to start matching"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    {(currentAct.pairs ?? []).map((p) => {
                      const isMatched = matchMap[p.left] != null;
                      const isSelected = selectedLeft === p.left;
                      return (
                        <button
                          key={p.left}
                          disabled={!canInteract}
                          onClick={() => handleLeftTap(p.left)}
                          className={`w-full h-12 rounded-xl flex items-center justify-center font-semibold text-base border-2 transition-all ${
                            isMatched
                              ? "bg-green-100 border-green-400 text-green-900"
                              : isSelected
                              ? "bg-orange-100 border-orange-400 text-orange-900 scale-105"
                              : "bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          {p.left}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {shuffledRights.map((right) => {
                      const isTaken = Object.values(matchMap).includes(right);
                      return (
                        <button
                          key={right}
                          disabled={!canInteract || isTaken || !selectedLeft}
                          onClick={() => handleRightTap(right)}
                          className={`w-full h-12 rounded-xl flex items-center justify-center font-semibold text-base border-2 transition-all ${
                            isTaken
                              ? "bg-green-100 border-green-400 text-green-900"
                              : selectedLeft
                              ? "bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200"
                              : "bg-gray-100 border-gray-200 text-gray-500"
                          }`}
                        >
                          {right}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

          {currentAct.type === "reflection" && !player.answer && (
            <p className="text-center text-gray-400 text-sm">Take a moment to think, then tap Continue.</p>
          )}

          {player.answer && currentAct.type === "reflection" && (
            <div className="rounded-2xl py-3 px-5 text-center font-bold text-lg bg-blue-50 text-blue-700">
              Thanks for sharing your thoughts! 💭
            </div>
          )}
          {player.answer && currentAct.type !== "reflection" && (
            <div
              className={`rounded-2xl py-3 px-5 text-center font-bold text-lg ${
                player.answer.correct ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"
              }`}
            >
              {player.answer.correct ? "Correct! Well done! 🎉" : "Good try! 💪"}
            </div>
          )}

          {!player.answer && (
            <button
              disabled={!canInteract || !isAnswerReady(currentAct, selectedOpt, fillValue, matchMap)}
              onClick={handleCheck}
              className="w-full h-14 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-2xl text-lg"
            >
              {currentAct.type === "reflection" ? "Continue ▶" : "Check Answer ✓"}
            </button>
          )}

          {currentAct.type === "multiple_choice" && canInteract && (
            <button
              onPointerDown={() => player.startListening(currentAct.options ?? [])}
              onPointerUp={() => player.stopListening()}
              className={`w-full h-12 rounded-2xl border-2 font-semibold text-sm transition-all ${
                player.isListening
                  ? "bg-red-500 border-red-600 text-white animate-pulse"
                  : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {player.isListening ? "🎤 Listening..." : "🎤 Hold to speak your answer"}
            </button>
          )}
        </div>
      )}

      {/* ── complete ──────────────────────────────────────────────────────────── */}
      {screen.kind === "complete" && (
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="text-5xl">🏆</div>
          <h2 className="text-3xl font-bold text-gray-800">Lesson Complete!</h2>
          <p className="text-xl text-gray-500">You scored {player.score} stars ⭐</p>
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
      )}

      {/* ── Footer nav (Back / Replay / Next) -- hidden on welcome & complete,
            which have their own primary actions ─────────────────────────────── */}
      {screen.kind !== "welcome" && screen.kind !== "complete" && (
        <div className="w-full max-w-md flex gap-2 mt-auto pt-2">
          <button
            disabled={!player.canGoBack}
            onClick={player.back}
            className="flex-1 h-12 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold disabled:opacity-30"
          >
            ◀ Back
          </button>
          <button
            onClick={player.replay}
            className="h-12 px-4 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold"
            aria-label="Replay narration"
          >
            🔊
          </button>
          <button
            disabled={!player.canGoNext}
            onClick={player.next}
            className="flex-1 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-30"
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Exit button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-400 hover:text-gray-600 underline"
      >
        Exit lesson
      </button>
    </div>
  );
}
