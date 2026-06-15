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

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);
  const cancelledRef = useRef(false);

  // initialise on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;

    const pickVoice = () => {
      const voices = synthRef.current!.getVoices();
      const enVoices = voices.filter((v) => v.lang.startsWith("en"));
      // prefer a female-sounding voice
      const female = enVoices.find(
        (v) =>
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("woman") ||
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("victoria") ||
          v.name.toLowerCase().includes("karen")
      );
      voiceRef.current = female ?? enVoices[1] ?? enVoices[0] ?? voices[0] ?? null;
    };

    pickVoice();
    synthRef.current.onvoiceschanged = pickVoice;

    return () => {
      cancelledRef.current = true;
      synthRef.current?.cancel();
      recogRef.current?.abort();
    };
  }, []);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (cancelledRef.current) { resolve(); return; }
      const synth = synthRef.current;
      if (!synth) { resolve(); return; }
      synth.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.voice = voiceRef.current;
      utt.rate = 0.88;
      utt.pitch = 1.1;
      utt.volume = 1.0;
      utt.onend = () => resolve();
      utt.onerror = () => resolve();
      synth.speak(utt);
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
      setState((s) => ({ ...s, phase: "narrating-content", contentIdx: i }));

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
    synthRef.current?.cancel();
    recogRef.current?.abort();
    setState((s) => ({ ...s, phase: "idle", isListening: false }));
  }, []);

  const submitAnswer = useCallback((answer: string) => {
    answerRef.current = answer;
  }, []);

  const startListening = useCallback(
    (currentOptions: string[]) => {
      const SR =
        (typeof window !== "undefined" &&
          (window.SpeechRecognition ||
            (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition })
              .webkitSpeechRecognition)) ||
        null;
      if (!SR) return;

      const recog = new SR();
      recog.lang = "en-US";
      recog.interimResults = false;
      recog.maxAlternatives = 3;

      recog.onresult = (e: SpeechRecognitionEvent) => {
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
