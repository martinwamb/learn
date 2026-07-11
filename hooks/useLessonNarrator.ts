"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NarratorPhase =
  | "idle"
  | "narrating-intro"
  | "narrating-content"
  | "question-intro"
  | "asking"
  | "waiting-answer"
  | "feedback"
  | "complete";

export interface ContentBlock {
  type: "introduction" | "explanation" | "activity";
  text?: string;
  example?: string;
  instruction?: string;
  items?: string[];
}

export interface Activity {
  type: "multiple_choice" | "fill_blank" | "matching";
  question?: string;
  sentence?: string;
  options?: string[];
  answer?: string;
  pairs?: { left: string; right: string }[];
}

export interface LessonData {
  title: string;
  objective: string;
  content: ContentBlock[];
  activities: Activity[];
  funFact?: string | null;
}

interface NarratorState {
  phase: NarratorPhase;
  actIdx: number;
  contentIdx: number;
  score: number;
  isListening: boolean;
  currentText: string;
  feedback: "correct" | "wrong" | null;
}

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

export function useLessonNarrator(lesson: LessonData) {
  const [state, setState] = useState<NarratorState>({
    phase: "idle",
    actIdx: 0,
    contentIdx: 0,
    score: 0,
    isListening: false,
    currentText: "",
    feedback: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef = useRef<any>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      audioRef.current?.pause();
      recogRef.current?.abort();
    };
  }, []);

  // Narration audio is generated server-side (edge-tts, Kenyan neural voice) and
  // served from a content-addressed cache -- see app/api/tts/speak/route.ts. Replaces
  // the old browser speechSynthesis approach, whose voice quality depended entirely on
  // whatever the visitor's OS/browser happened to expose.
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (cancelledRef.current) { resolve(); return; }
      audioRef.current?.pause();

      // Safety net: media events can occasionally fail to fire (mirrors the old
      // speechSynthesis.onend bug). Estimate reading time at ~65ms/char, min 1.5s, max 30s.
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
          if (cancelledRef.current) { finish(); return; }
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = finish;
          audio.onerror = finish;
          audio.play().catch(finish);
        })
        .catch(() => finish());
    });
  }, []);

  const delay = (ms: number) =>
    new Promise<void>((res) => setTimeout(res, ms));

  // ── narration sequence ───────────────────────────────────────────────────

  const runContent = useCallback(async () => {
    const blocks = lesson.content;
    for (let i = 0; i < blocks.length; i++) {
      if (cancelledRef.current) return;
      const block = blocks[i];
      setState((s) => ({
        ...s,
        phase: "narrating-content",
        contentIdx: i,
        currentText: block.text ?? block.instruction ?? block.example ?? "",
      }));

      if (block.type === "introduction" && block.text) {
        await speak(block.text);
      } else if (block.type === "explanation") {
        if (block.text) await speak(block.text);
        if (block.example) await speak(`For example: ${block.example}`);
      } else if (block.type === "activity") {
        if (block.instruction) await speak(block.instruction);
        if (block.items?.length) {
          await speak(block.items.join(". "));
        }
      }
      await delay(300);
    }

    if (lesson.funFact) {
      await speak(`Fun fact: ${lesson.funFact}`);
      await delay(400);
    }
  }, [lesson, speak]);

  const buildQuestionText = useCallback((act: Activity): string => {
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
    return "";
  }, []);

  const runActivities = useCallback(
    async (
      onComplete: (score: number) => void,
      answerRef: React.MutableRefObject<string | null>
    ) => {
      const activities = lesson.activities;

      setState((s) => ({ ...s, phase: "question-intro" }));
      await speak("Now let's try some fun questions! Listen carefully.");
      await delay(300);

      let score = 0;

      for (let i = 0; i < activities.length; i++) {
        if (cancelledRef.current) return;
        const act = activities[i];
        const qText = buildQuestionText(act);

        setState((s) => ({
          ...s,
          phase: "asking",
          actIdx: i,
          currentText: qText,
          feedback: null,
        }));
        await speak(qText);

        setState((s) => ({ ...s, phase: "waiting-answer" }));
        answerRef.current = null;

        // wait for tap answer (up to 30 s)
        await new Promise<void>((res) => {
          const check = setInterval(() => {
            if (answerRef.current !== null || cancelledRef.current) {
              clearInterval(check);
              res();
            }
          }, 100);
          setTimeout(() => { clearInterval(check); res(); }, 30_000);
        });

        if (cancelledRef.current) return;

        const given = answerRef.current ?? "";
        const correct = isCorrect(act, given);

        setState((s) => ({
          ...s,
          phase: "feedback",
          feedback: correct ? "correct" : "wrong",
        }));

        if (correct) {
          score += 10;
          const phrase = CORRECT_PHRASES[i % CORRECT_PHRASES.length];
          await speak(phrase);
        } else {
          const wrongPhrase = WRONG_PHRASES[i % WRONG_PHRASES.length];
          const answer = act.answer ?? (act.pairs?.map((p) => `${p.left} — ${p.right}`).join(", ") ?? "");
          await speak(`${wrongPhrase} The answer is: ${answer}`);
        }

        setState((s) => ({ ...s, score }));
        await delay(1200);
      }

      setState((s) => ({ ...s, phase: "complete", score }));
      await speak(
        `Amazing work! You finished the lesson and scored ${score} stars! Keep it up!`
      );
      onComplete(score);
    },
    [lesson, speak, buildQuestionText]
  );

  // ── public API ───────────────────────────────────────────────────────────

  const answerRef = useRef<string | null>(null);

  const start = useCallback(
    (onComplete: (score: number) => void) => {
      cancelledRef.current = false;

      const run = async () => {
        setState((s) => ({
          ...s,
          phase: "narrating-intro",
          currentText: `Welcome! Today we are learning about ${lesson.title}. ${lesson.objective}`,
        }));
        await speak(
          `Welcome! Today we are learning about ${lesson.title}. ${lesson.objective}`
        );
        await delay(400);

        await runContent();
        await runActivities(onComplete, answerRef);
      };

      run().catch(console.error);
    },
    [lesson, speak, runContent, runActivities]
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    audioRef.current?.pause();
    recogRef.current?.abort();
    setState((s) => ({ ...s, phase: "idle", isListening: false }));
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    answerRef.current = answer;
  }, []);

  const startListening = useCallback(
    (currentOptions: string[]) => {
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
        const match = currentOptions.find((opt) =>
          transcript.includes(opt.toLowerCase().split(" ")[0])
        );
        if (match) answerRef.current = match;
        setState((s) => ({ ...s, isListening: false }));
      };
      recog.onerror = () => setState((s) => ({ ...s, isListening: false }));
      recog.onend = () => setState((s) => ({ ...s, isListening: false }));

      recogRef.current = recog;
      recog.start();
      setState((s) => ({ ...s, isListening: true }));
    },
    []
  );

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  return {
    phase: state.phase,
    actIdx: state.actIdx,
    contentIdx: state.contentIdx,
    score: state.score,
    feedback: state.feedback,
    currentText: state.currentText,
    isListening: state.isListening,
    start,
    stop,
    submitAnswer,
    startListening,
    stopListening,
    currentActivity: lesson.activities[state.actIdx] ?? null,
  };
}

function isCorrect(act: Activity, given: string): boolean {
  if (!given) return false;
  const g = given.trim().toLowerCase();
  if (act.type === "multiple_choice") {
    return g === (act.answer ?? "").toLowerCase();
  }
  if (act.type === "fill_blank") {
    return g === (act.answer ?? "").toLowerCase();
  }
  if (act.type === "matching") {
    // simplified: always award for matching if all options selected
    return given === "__all_matched__";
  }
  return false;
}
