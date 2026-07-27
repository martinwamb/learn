import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import { storyToLessonData } from "@/lib/story/to-lesson-data";
import { resolveGames } from "@/lib/games/derive";
import { READING_LEVELS, isReadingLevel } from "@/lib/story/reading-levels";

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string; storySlug: string }>;
  searchParams: Promise<{ storyId?: string }>;
}) {
  await params; // route segments are cosmetic here -- the story is resolved by ?storyId=
  const { storyId } = await searchParams;

  if (!storyId) notFound();

  // findFirst with an explicit status filter rather than findUnique, so a guessed or
  // leaked draft id 404s for a normal session instead of rendering unreviewed content --
  // same reasoning as the lesson route.
  const story = await db.story.findFirst({
    where: { id: storyId, status: "published" },
    include: { unit: { include: { subject: { include: { grade: true } } } } },
  });

  if (!story) notFound();

  const lessonData = storyToLessonData(story);
  const games = resolveGames(story.games, { ...lessonData, vocabulary: story.vocabulary });
  const level = isReadingLevel(story.readingLevel) ? READING_LEVELS[story.readingLevel] : null;
  const gradeCode = story.unit.subject.grade.code;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/stories/${gradeCode}`} className="text-orange-500 hover:underline text-sm">
          ← Jina&rsquo;s Stories
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{story.title}</h1>
        <p className="text-sm text-gray-400">
          {story.unit.subject.name} · Unit {story.unit.sequence}: {story.unit.title}
          {level ? ` · ${level.label}` : ""} · {story.duration} min
        </p>
      </div>

      <LessonPlayer
        lesson={{
          id: story.id,
          title: story.title,
          objective: story.objective,
          content: lessonData.content as never,
          activities: lessonData.activities as never,
          funFact: story.funFact,
          duration: story.duration,
        }}
        // Narration on by default for everyone who is still learning to decode. Unlike
        // lessons (PP1/PP2 only), this includes G1: the whole point of a story at this
        // level is hearing the words while seeing them.
        defaultAudioMode={gradeCode === "PP1" || gradeCode === "PP2" || gradeCode === "G1"}
        kind="story"
        games={games}
        gamesHref={`/games/${gradeCode}`}
      />
    </div>
  );
}
