import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function TraditionPage({
  params,
}: {
  params: Promise<{ traditionSlug: string }>;
}) {
  const { traditionSlug } = await params;
  const session = await auth();

  const tradition = await db.religiousTradition.findUnique({
    where: { slug: traditionSlug },
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

  if (!tradition) notFound();

  const completedIds = new Set(
    (
      await db.userProgress.findMany({
        where: {
          userId: session!.user!.id,
          completed: true,
          type: "religious-lesson",
          religiousLesson: { unit: { traditionId: tradition.id } },
        },
        select: { religiousLessonId: true },
      })
    )
      .map((p) => p.religiousLessonId)
      .filter(Boolean) as string[]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/faith" className="text-orange-500 hover:underline text-sm">
          ← Faith Stories
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-4xl">{tradition.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{tradition.name}</h1>
            <p className="text-gray-400">{tradition.units.length} units</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {tradition.units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-gray-700 text-lg mb-1">{unit.title}</h2>
            <p className="text-sm text-gray-400 mb-4">
              Ages {unit.ageMin}-{unit.ageMax} • {unit.lessons.length} {unit.lessons.length === 1 ? "lesson" : "lessons"}
            </p>

            <div className="space-y-2">
              {unit.lessons.map((lesson, idx) => {
                const done = completedIds.has(lesson.id);
                const lessonSlug = `lesson-${lesson.sequence}`;
                return (
                  <Link
                    key={lesson.id}
                    href={`/faith/${traditionSlug}/${lessonSlug}?lessonId=${lesson.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      done
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200"
                    }`}
                  >
                    <span className="text-xl">{done ? "✅" : idx === 0 ? "▶️" : "📄"}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 text-sm">{lesson.title}</div>
                      <div className="text-xs text-gray-400">{lesson.duration} min</div>
                    </div>
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
