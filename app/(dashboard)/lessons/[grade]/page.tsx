import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function GradePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;

  const gradeData = await db.grade.findUnique({
    where: { code: grade.toUpperCase() },
    include: {
      subjects: {
        include: {
          _count: { select: { units: true } },
          units: { include: { _count: { select: { lessons: true } } } },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!gradeData) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-orange-500 hover:underline text-sm">← Back</Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">{gradeData.name}</h1>
        <p className="text-gray-500">Ages {gradeData.ageRange} — Kenya CBC</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {gradeData.subjects.map((subject) => {
          const totalLessons = subject.units.reduce((acc, u) => acc + u._count.lessons, 0);
          return (
            <Link
              key={subject.id}
              href={`/lessons/${grade}/${subject.slug}`}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100"
              style={{ borderLeft: `5px solid ${subject.color}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{subject.icon}</span>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg leading-tight">{subject.name}</h2>
                  <p className="text-sm text-gray-400">{subject._count.units} units • {totalLessons} lessons</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">Tap to explore units →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
