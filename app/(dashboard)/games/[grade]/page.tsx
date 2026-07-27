import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { resolveGames } from "@/lib/games/derive";
import { storyToLessonData } from "@/lib/story/to-lesson-data";
import GamePicker, { type GameEntry } from "@/components/game/GamePicker";

// The games hub: every game playable at this grade, gathered from both lessons and
// stories. Most entries here are derived rather than authored (lib/games/derive.ts) --
// that's deliberate, and it's what lets the hub be full on day one instead of waiting
// for someone to hand-write games for 181 existing lessons.

export default async function GamesByGrade({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  const gradeCode = grade.toUpperCase();

  const gradeData = await db.grade.findUnique({ where: { code: gradeCode } });
  if (!gradeData) notFound();

  const [lessons, stories] = await Promise.all([
    db.lesson.findMany({
      where: { status: "published", unit: { subject: { gradeId: gradeData.id } } },
      include: { unit: { include: { subject: true } } },
      orderBy: { sequence: "asc" },
    }),
    db.story.findMany({
      where: { status: "published", unit: { subject: { gradeId: gradeData.id } } },
      include: { unit: { include: { subject: true } } },
      orderBy: { sequence: "asc" },
    }),
  ]);

  const entries: GameEntry[] = [];

  for (const lesson of lessons) {
    const games = resolveGames(lesson.games, {
      title: lesson.title,
      objective: lesson.objective,
      content: lesson.content as never,
      activities: lesson.activities as never,
    });
    for (const game of games) {
      entries.push({
        game,
        sourceKind: "lesson",
        sourceId: lesson.id,
        sourceTitle: lesson.title,
        subjectName: lesson.unit.subject.name,
        subjectIcon: lesson.unit.subject.icon,
      });
    }
  }

  for (const story of stories) {
    const lessonData = storyToLessonData(story);
    const games = resolveGames(story.games, { ...lessonData, vocabulary: story.vocabulary });
    for (const game of games) {
      entries.push({
        game,
        sourceKind: "story",
        sourceId: story.id,
        sourceTitle: story.title,
        subjectName: story.unit.subject.name,
        subjectIcon: story.unit.subject.icon,
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Games 🎮</h1>
        <p className="text-gray-500">
          {gradeData.name} · {entries.length} {entries.length === 1 ? "game" : "games"} to play
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          No games here yet — finish a lesson and they will appear.
        </div>
      ) : (
        <GamePicker entries={entries} />
      )}
    </div>
  );
}
