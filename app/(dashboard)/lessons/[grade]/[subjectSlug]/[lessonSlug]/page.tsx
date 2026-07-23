import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import LessonPlayer from "@/components/lesson/LessonPlayer";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string; subjectSlug: string; lessonSlug: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { grade, subjectSlug } = await params;
  const { lessonId } = await searchParams;

  if (!lessonId) notFound();

  // findFirst (not findUnique) with an explicit status filter -- rather than
  // combining a non-unique filter into findUnique's where clause -- so a
  // guessed/leaked draft lessonId 404s for a normal kid session instead of
  // rendering an unreviewed lesson.
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, status: "published" },
    include: { unit: { include: { subject: { include: { grade: true } } } } },
  });

  if (!lesson) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/lessons/${grade}/${subjectSlug}`}
          className="text-orange-500 hover:underline text-sm"
        >
          ← {lesson.unit.subject.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{lesson.title}</h1>
        <p className="text-sm text-gray-400">
          Unit {lesson.unit.sequence}: {lesson.unit.title} • {lesson.duration} min
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
        defaultAudioMode={grade === "PP1" || grade === "PP2"}
      />
    </div>
  );
}
