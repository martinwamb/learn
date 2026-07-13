"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildScreens, type Activity, type LessonData, type Screen } from "@/lib/lesson/screens";

export type { Activity, ContentBlock, LessonData, Screen } from "@/lib/lesson/screens";

export type QuestionStatus = "narrating" | "waiting" | "feedback";

const CORRECT_PHRASES = [
  "Correct! Well done!",
  "Fantastic! You got it!",
  "Great job! That's right!",
  "Amazing! You're so clever!",
  "Yes! Perfect answer!",
];

const WRONG_PHRASES = [
  "Not quite — let's keep going!",
  "Good try! Let's move on.",
  "Almost! Keep it up!",
];

const REFLECTION_PHRASES = ["Great thinking!", "Thanks for sharing that!", "Lovely reflection!"];

function buildQuestionText(act: Activity): string {
  if (act.type === "multiple_choice") {
    const opts = (act.options ?? []).join(", ");
    return `${act.question}. Is it: ${opts}?`;
  }
  if (act.type === "fill_blank") {
    return `Complete the sentence: ${act.sentence}. What is the missing word?`;
  }
  if (act.type === "matching") {
    return "Match the words on the left with those on the right.";
  }
  if (act.type === "reflection") {
    return act.prompt ?? "";
  }
  return "";
}

// Reflection activities are always "correct" -- there's no wrong answer, just a
// prompt to think about. Scoring excludes them separately (see `score` below).
function isCorrect(act: Activity, given: string): boolean {
  if (act.type === "reflection") return true;
  if (!given) return false;
  const g = given.trim().toLowerCase();
  if (act.type === "multiple_choice") return g === (act.answer ?? "").toLowerCase();
  if (act.type === "fill_blank") return g === (act.answer ?? "").toLowerCase();
  if (act.type === "matching") return given === "__all_matched__";
  return false;
}

function getScreenNarration(screen: Screen, lesson: LessonData): string {
  switch (screen.kind) {
    case "welcome":
      return "";
    case "content":
      return screen.text;
    case "item":
      return screen.itemIdx === 0 && screen.instruction
        ? `${screen.instruction} ${screen.item}`
        : screen.item;
    case "item-group":
      return screen.instruction
        ? `${screen.instruction} ${screen.items.join(". ")}`
        : screen.items.join(". ");
    case "memory-verse":
      return `${screen.text} — ${screen.reference}`;
    case "funfact":
      return `Fun fact: ${screen.text}`;
    case "question":
      return buildQuestionText(lesson.activities[screen.actIdx]);
    case "complete":
      return "";
  }
}

function resolveScreenText(screen: Screen, lesson: LessonData, score: number): string {
  if (screen.kind === "complete") {
    return `Amazing work! You finished the lesson and scored ${score} stars! Keep it up!`;
  }
  return getScreenNarration(screen, lesson);
}

export function useLessonPlayer(
  lesson: LessonData,
  initialAudioMode: boolean,
  onAnswered?: (correct: boolean) => void
) {
  const screens = useMemo(() => buildScreens(lesson), [lesson]);
  const [screenIdx, setScreenIdx] = useState(0);
  const [audioMode, setAudioMode] = useState(initialAudioMode);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus>("narrating");
  const [answers, setAnswers] = useState<Record<number, { given: string; correct: boolean }>>({});
  const [isListening, setIsListening] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      recogRef.current?.abort();
    };
  }, []);

  const screen = screens[screenIdx];

  // Score excludes "reflection" activities (no right/wrong to score) and derives
  // purely from recorded answers rather than being threaded imperatively.
  const score = useMemo(() => {
    let total = 0;
    for (const [idxStr, ans] of Object.entries(answers)) {
      const s = screens[Number(idxStr)];
      if (s?.kind !== "question") continue;
      const act = lesson.activities[s.actIdx];
      if (act.type === "reflection") continue;
      if (ans.correct) total += 10;
    }
    return total;
  }, [answers, screens, lesson.activities]);

  // Narration audio is generated server-side (edge-tts, Kenyan neural voice) and
  // served from a content-addressed cache -- see app/api/tts/speak/route.ts.
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!text) { resolve(); return; }
      audioRef.current?.pause();

      // Safety net: media events can occasionally fail to fire. Estimate reading
      // time at ~65ms/char, min 1.5s, max 30s.
      const ms = Math.min(Math.max(text.length * 65, 1500), 30_000);
      const t = setTimeout(() => resolve(), ms);
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(t);
        resolve();
      };

      fetch(`/api/tts/speak?text=${encodeURIComponent(text)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`TTS HTTP ${res.status}`))))
        .then(({ url }: { url: string }) => {
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = finish;
          audio.onerror = finish;
          audio.play().catch(finish);
        })
        .catch(() => finish());
    });
  }, []);

  const replay = useCallback(() => {
    speak(resolveScreenText(screen, lesson, score));
  }, [screen, lesson, score, speak]);

  // Render-time state adjustment (React's documented pattern for "reset derived
  // state when a value changes", used instead of an effect here): as soon as
  // screenIdx changes, synchronously decide the question's initial status before
  // paint. This intentionally does NOT live in a useEffect -- setState calls
  // directly in an effect body (outside an async callback) are disallowed by this
  // project's lint config, and this is fundamentally a synchronous derivation
  // (everything it needs -- screen, lesson, audioMode, the already-answered check --
  // is available synchronously; only the actual audio fetch+playback below is async).
  // Uses state (not a ref) for the "last seen" comparison -- refs can't be read or
  // written during render under this project's lint config either.
  const [lastScreenIdx, setLastScreenIdx] = useState(-1);
  if (lastScreenIdx !== screenIdx) {
    setLastScreenIdx(screenIdx);
    if (screen.kind === "question") {
      const alreadyAnswered = answers[screenIdx] != null;
      if (alreadyAnswered) {
        setQuestionStatus("feedback");
      } else {
        const willSpeak = audioMode && !!getScreenNarration(screen, lesson);
        setQuestionStatus(willSpeak ? "narrating" : "waiting");
      }
    }
  }

  // Fires the actual (async) narration playback once per screen entry when audio
  // mode is on. Never auto-advances afterward -- that's the actual "more control"
  // fix. Deliberately excludes `answers` from deps (read via ref) so answering the
  // current question doesn't re-trigger this and step on checkAnswer()'s feedback
  // speech. No synchronous setState calls in this effect body -- only inside the
  // async .then() callback, which is exempt from the lint rule above.
  useEffect(() => {
    let cancelled = false;

    if (screen.kind === "welcome" || !audioMode) return;

    const isQuestion = screen.kind === "question";
    const alreadyAnswered = isQuestion && answersRef.current[screenIdx] != null;
    if (isQuestion && alreadyAnswered) return; // reviewing -- don't auto-narrate

    const text = resolveScreenText(screen, lesson, score);
    if (!text) return;

    speak(text).then(() => {
      if (cancelled) return;
      if (isQuestion) setQuestionStatus("waiting");
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenIdx, audioMode]);

  const canGoNext = !(screen.kind === "question" && answers[screenIdx] == null);
  const canGoBack = screenIdx > 0;

  const next = useCallback(() => {
    setScreenIdx((i) => {
      const s = screens[i];
      if (s.kind === "question" && answersRef.current[i] == null) return i;
      audioRef.current?.pause();
      return Math.min(i + 1, screens.length - 1);
    });
  }, [screens]);

  const back = useCallback(() => {
    audioRef.current?.pause();
    setScreenIdx((i) => Math.max(i - 1, 0));
  }, []);

  // Returns whether the answer was correct, synchronously, AND calls the optional
  // onAnswered callback -- covers both the direct tap path and the mic path below
  // uniformly (a component-side wrapper around just the tap path would miss mic
  // answers), letting the component trigger SFX without effect-based edge-detection
  // that would need to distinguish "just answered" from "revisiting an answered screen".
  const checkAnswer = useCallback(
    (given: string): boolean => {
      if (screen.kind !== "question") return false;
      const act = lesson.activities[screen.actIdx];
      const correct = isCorrect(act, given);
      setAnswers((a) => ({ ...a, [screenIdx]: { given, correct } }));
      setQuestionStatus("feedback");

      if (act.type === "reflection") {
        speak(REFLECTION_PHRASES[screen.actIdx % REFLECTION_PHRASES.length]);
      } else {
        if (correct) {
          speak(CORRECT_PHRASES[screen.actIdx % CORRECT_PHRASES.length]);
        } else {
          const answer = act.answer ?? (act.pairs?.map((p) => `${p.left} — ${p.right}`).join(", ") ?? "");
          speak(`${WRONG_PHRASES[screen.actIdx % WRONG_PHRASES.length]} The answer is: ${answer}`);
        }
        onAnswered?.(correct); // no graded SFX for reflection -- there's no right/wrong
      }
      return correct;
    },
    [screen, screenIdx, lesson.activities, speak, onAnswered]
  );

  const startListening = useCallback(
    (options: string[]) => {
      if (typeof window === "undefined") return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recog = new SR() as any;
      recog.lang = "en-US";
      recog.interimResults = false;
      recog.maxAlternatives = 3;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recog.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript.toLowerCase();
        const match = options.find((opt) => transcript.includes(opt.toLowerCase().split(" ")[0]));
        setIsListening(false);
        if (match) checkAnswer(match);
      };
      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      recogRef.current = recog;
      recog.start();
      setIsListening(true);
    },
    [checkAnswer]
  );

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    screens,
    screenIdx,
    screen,
    questionStatus,
    answers,
    answer: answers[screenIdx],
    score,
    audioMode,
    setAudioMode,
    isListening,
    canGoNext,
    canGoBack,
    next,
    back,
    replay,
    checkAnswer,
    startListening,
    stopListening,
  };
}
