import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ grade: string; subjectSlug: string }>;
}) {
  const { grade, subjectSlug } = await params;
  const session = await auth();

  const gradeData = await db.grade.findUnique({ where: { code: grade.toUpperCase() } });
  if (!gradeData) notFound();

  const subject = await db.subject.findUnique({
    where: { gradeId_slug: { gradeId: gradeData.id, slug: subjectSlug } },
    include: {
      units: {
        include: {
          lessons: {
            orderBy: { sequence: "asc" },
            select: { id: true, title: true, sequence: true, duration: true, source: true },
          },
        },
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!subject) notFound();

  // Fetch user's completed lessons for this subject
  const completedIds = new Set(
    (
      await db.userProgress.findMany({
        where: {
          userId: session!.user!.id,
          completed: true,
          type: "lesson",
          lesson: { unit: { subjectId: subject.id } },
        },
        select: { lessonId: true },
      })
    )
      .map((p) => p.lessonId)
      .filter(Boolean) as string[]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href={`/lessons/${grade}`} className="text-orange-500 hover:underline text-sm">
          ← {gradeData.name}
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-4xl">{subject.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{subject.name}</h1>
            <p className="text-gray-400">{subject.units.length} units</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {subject.units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-gray-700 text-lg mb-1">
              Unit {unit.sequence}: {unit.title}
            </h2>
            <p className="text-sm text-gray-400 mb-4">{unit.lessons.length} lessons</p>

            <div className="space-y-2">
              {unit.lessons.map((lesson, idx) => {
                const done = completedIds.has(lesson.id);
                const lessonSlug = `lesson-${lesson.sequence}`;
                return (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${grade}/${subjectSlug}/${lessonSlug}?lessonId=${lesson.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      done
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200"
                    }`}
                  >
                    <span className="text-xl">
                      {done ? "✅" : idx === 0 ? "▶️" : "📄"}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 text-sm">{lesson.title}</div>
                      <div className="text-xs text-gray-400">{lesson.duration} min</div>
                    </div>
                    {lesson.source === "ai-generated" && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
