import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import LessonPlayer from "@/components/lesson/LessonPlayer";

export default async function FaithLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ traditionSlug: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { traditionSlug } = await params;
  const { lessonId } = await searchParams;

  if (!lessonId) notFound();

  const lesson = await db.religiousLesson.findUnique({
    where: { id: lessonId },
    include: { unit: { include: { tradition: true } } },
  });

  if (!lesson) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/faith/${traditionSlug}`}
          className="text-orange-500 hover:underline text-sm"
        >
          ← {lesson.unit.tradition.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{lesson.title}</h1>
        <p className="text-sm text-gray-400">
          {lesson.unit.title} • {lesson.duration} min
        </p>
      </div>

      <LessonPlayer
        lesson={{
          id: lesson.id,
          title: lesson.title,
          objective: lesson.objective,
          content: lesson.content as never,
          activities: lesson.activities as never,
          funFact: lesson.funFact,
          duration: lesson.duration,
        }}
        defaultAudioMode={lesson.unit.ageMin <= 6}
        kind="religious-lesson"
      />
    </div>
  );
}
