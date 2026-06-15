import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const profile = await db.userProfile.findUnique({ where: { userId } });
  const grades = await db.grade.findMany({ orderBy: { order: "asc" } });

  // Total lessons completed this user
  const completedCount = await db.userProgress.count({
    where: { userId, completed: true, type: "lesson" },
  });

  const gradeCode = profile?.gradeCode ?? "G1";
  const currentGrade = grades.find((g) => g.code === gradeCode);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-3xl p-6 mb-8 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-1">
          Habari, {session?.user?.name?.split(" ")[0] ?? "Learner"}! 👋
        </h1>
        <p className="opacity-90">
          {currentGrade?.name ?? "Grade 1"} • {profile?.streak ?? 0} day streak 🔥 • {profile?.totalPoints ?? 0} points ⭐
        </p>
        <div className="mt-4 flex gap-3">
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <div className="text-2xl font-bold">{completedCount}</div>
            <div className="text-xs opacity-80">Lessons done</div>
          </div>
        </div>
      </div>

      {/* Grade Selector */}
      <h2 className="text-xl font-bold text-gray-700 mb-4">Choose your level</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {grades.map((grade) => (
          <Link
            key={grade.code}
            href={`/lessons/${grade.code}`}
            className={`rounded-2xl p-5 text-center font-bold text-lg shadow transition-all hover:scale-105 ${
              grade.code === gradeCode
                ? "bg-orange-500 text-white ring-4 ring-orange-200"
                : "bg-white text-gray-700 hover:bg-orange-50"
            }`}
          >
            <div className="text-3xl mb-1">
              {grade.code.startsWith("PP") ? "🐣" : grade.code === "G1" ? "🌱" : grade.code === "G2" ? "🌿" : "🌳"}
            </div>
            {grade.name}
            <div className="text-sm font-normal opacity-70">{grade.ageRange} years</div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-xl font-bold text-gray-700 mb-4">Explore</h2>
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/lessons/${gradeCode}`}
          className="bg-purple-100 hover:bg-purple-200 rounded-2xl p-5 flex items-center gap-3 transition-all"
        >
          <span className="text-4xl">🎓</span>
          <div>
            <div className="font-bold text-purple-800">My Lessons</div>
            <div className="text-sm text-purple-600">{currentGrade?.name}</div>
          </div>
        </Link>
        <Link
          href="/library"
          className="bg-blue-100 hover:bg-blue-200 rounded-2xl p-5 flex items-center gap-3 transition-all"
        >
          <span className="text-4xl">📖</span>
          <div>
            <div className="font-bold text-blue-800">Story Library</div>
            <div className="text-sm text-blue-600">Books &amp; Read Aloud</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
