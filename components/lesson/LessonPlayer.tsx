"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContentBlock {
  type: "introduction" | "explanation" | "activity";
  text?: string;
  example?: string;
  instruction?: string;
  items?: string[];
}

interface Activity {
  type: "multiple_choice" | "fill_blank" | "matching";
  question?: string;
  sentence?: string;
  options?: string[];
  answer?: string;
  pairs?: { left: string; right: string }[];
}

interface LessonPlayerProps {
  lesson: {
    id: string;
    title: string;
    objective: string;
    content: ContentBlock[];
    activities: Activity[];
    funFact?: string | null;
    duration: number;
  };
  gradeCode: string;
  subjectSlug: string;
}

export default function LessonPlayer({ lesson, gradeCode, subjectSlug }: LessonPlayerProps) {
  const router = useRouter();
  const [step, setStep] = useState<"content" | "activities" | "done">("content");
  const [actIdx, setActIdx] = useState(0);
  const [selected, setSelected] = useState<string>("");
  const [fillValue, setFillValue] = useState("");
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const activities = lesson.activities as Activity[];
  const currentActivity = activities[actIdx];

  function checkAnswer(): boolean {
    if (!currentActivity) return false;
    if (currentActivity.type === "multiple_choice") return selected === currentActivity.answer;
    if (currentActivity.type === "fill_blank") {
      return fillValue.trim().toLowerCase() === (currentActivity.answer ?? "").toLowerCase();
    }
    if (currentActivity.type === "matching") {
      return (currentActivity.pairs ?? []).every((p) => matchSelections[p.left] === p.right);
    }
    return false;
  }

  function handleSubmitAnswer() {
    const correct = checkAnswer();
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 10);
  }

  function handleNext() {
    setFeedback(null);
    setSelected("");
    setFillValue("");
    setMatchSelections({});
    if (actIdx + 1 < activities.length) {
      setActIdx((i) => i + 1);
    } else {
      handleComplete();
    }
  }

  async function handleComplete() {
    setSaving(true);
    try {
      await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, score }),
      });
    } catch { /* non-fatal */ }
    setSaving(false);
    setStep("done");
  }

  if (step === "content") {
    return (
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-800 text-sm">
          <span className="font-semibold">Objective:</span> {lesson.objective}
        </div>

        {(lesson.content as ContentBlock[]).map((block, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
            {block.type === "introduction" && (
              <p className="text-gray-700 text-lg leading-relaxed">{block.text}</p>
            )}
            {block.type === "explanation" && (
              <>
                <p className="text-gray-700 leading-relaxed mb-3">{block.text}</p>
                {block.example && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-3 text-sm text-yellow-800 whitespace-pre-line">
                    {block.example}
                  </div>
                )}
              </>
            )}
            {block.type === "activity" && (
              <>
                <p className="font-semibold text-gray-700 mb-2">{block.instruction}</p>
                <ul className="space-y-1">
                  {(block.items ?? []).map((item, j) => (
                    <li key={j} className="text-gray-600 pl-4 border-l-2 border-orange-200">{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}

        {lesson.funFact && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-800 text-sm">
            <span className="font-semibold">Fun Fact:</span> {lesson.funFact}
          </div>
        )}

        <button
          onClick={() => setStep("activities")}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
        >
          Start Activities 🎯
        </button>
      </div>
    );
  }

  if (step === "activities" && currentActivity) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {actIdx + 1} of {activities.length}</span>
          <span>Score: {score} ⭐</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {currentActivity.type === "multiple_choice" && (
            <>
              <p className="font-semibold text-gray-800 text-lg mb-5">{currentActivity.question}</p>
              <div className="grid grid-cols-2 gap-3">
                {(currentActivity.options ?? []).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !feedback && setSelected(opt)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      selected === opt
                        ? feedback === "correct" ? "bg-green-100 border-green-500 text-green-800"
                          : feedback === "wrong" ? "bg-red-100 border-red-400 text-red-800"
                          : "bg-orange-100 border-orange-400 text-orange-800"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}

          {currentActivity.type === "fill_blank" && (
            <>
              <p className="font-semibold text-gray-800 text-lg mb-5">
                {(currentActivity.sentence ?? "").replace("___", "________")}
              </p>
              <input
                type="text"
                value={fillValue}
                onChange={(e) => !feedback && setFillValue(e.target.value)}
                placeholder="Type your answer..."
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-lg focus:border-orange-400 focus:outline-none"
              />
            </>
          )}

          {currentActivity.type === "matching" && (
            <>
              <p className="font-semibold text-gray-800 mb-5">Match the items:</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {(currentActivity.pairs ?? []).map((pair) => (
                    <div key={pair.left} className="bg-blue-50 rounded-xl p-3 text-center font-medium text-blue-800">
                      {pair.left}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {(currentActivity.pairs ?? []).map((pair) => (
                    <select
                      key={pair.right}
                      value={matchSelections[pair.left] ?? ""}
                      onChange={(e) =>
                        !feedback && setMatchSelections((prev) => ({ ...prev, [pair.left]: e.target.value }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-orange-400 focus:outline-none"
                    >
                      <option value="">Select...</option>
                      {(currentActivity.pairs ?? []).map((p) => (
                        <option key={p.right} value={p.right}>{p.right}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {feedback && (
          <div className={`rounded-2xl p-4 text-center font-bold text-lg ${
            feedback === "correct" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {feedback === "correct" ? "Correct! Well done! 🎉" : `Not quite. The answer is: ${currentActivity.answer ?? "see above"}`}
          </div>
        )}

        {!feedback ? (
          <button
            onClick={handleSubmitAnswer}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            {actIdx + 1 < activities.length ? "Next Question →" : saving ? "Saving..." : "Finish Lesson 🏆"}
          </button>
        )}
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="text-center py-10 space-y-6">
        <div className="text-7xl">🏆</div>
        <h2 className="text-3xl font-bold text-gray-800">Lesson Complete!</h2>
        <p className="text-gray-500">You scored {score} points</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl transition-colors"
          >
            Back to Subject
          </button>
          <button
            onClick={() => router.push("/library")}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-8 rounded-2xl transition-colors"
          >
            Read a Story 📖
          </button>
        </div>
      </div>
    );
  }

  return null;
}
