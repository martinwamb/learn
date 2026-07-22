import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { AGE_BRACKETS } from "@/lib/faith-age-brackets";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const profile = await db.userProfile.findUnique({ where: { userId } });
  const grades = await db.grade.findMany({ orderBy: { order: "asc" } });
  const traditions = await db.religiousTradition.findMany({ orderBy: { name: "asc" } });

  // Total lessons completed this user
  const completedCount = await db.userProgress.count({
    where: { userId, completed: true, type: "lesson" },
  });

  const gradeCode = profile?.gradeCode ?? "G1";
  const currentGrade = grades.find((g) => g.code === gradeCode);
  // Pure navigation hint, not a saved preference -- mirrors how the grade grid below
  // highlights the profile's existing gradeCode without the tiles themselves writing
  // anything back. PP1/PP2 (ages 4-6) map to the "Early Years" bracket, G1-G3 to "Junior".
  const recommendedBracketSlug = gradeCode.startsWith("PP") ? "4-6" : "7-9";

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

      {/* Top-level chooser */}
      <h2 className="text-xl font-bold text-gray-700 mb-4">What would you like to explore today?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href={`/lessons/${gradeCode}`}
          className="bg-gradient-to-br from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 rounded-2xl p-6 flex items-center gap-4 transition-all shadow"
        >
          <span className="text-5xl">📚</span>
          <div>
            <div className="font-bold text-orange-800 text-lg">CBC Lessons</div>
            <div className="text-sm text-orange-600">Kenya&apos;s school curriculum, {currentGrade?.name ?? "your grade"}</div>
          </div>
        </Link>
        <Link
          href="/faith"
          className="bg-gradient-to-br from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 rounded-2xl p-6 flex items-center gap-4 transition-all shadow"
        >
          <span className="text-5xl">🙏</span>
          <div>
            <div className="font-bold text-purple-800 text-lg">Faith Stories</div>
            <div className="text-sm text-purple-600">Stories and lessons from scripture</div>
          </div>
        </Link>
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

      {/* Faith Stories age-group selector -- same "fast shortcut, not a saved
          preference" shape as the grade grid above: the highlighted bracket is
          derived from gradeCode, tapping any tile just jumps into that
          tradition+bracket's lesson list. */}
      {traditions.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Choose your Faith Stories age group</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {traditions.map((tradition) => (
              <div
                key={tradition.id}
                className="bg-white rounded-2xl p-4 shadow border border-gray-100"
                style={{ borderTop: `4px solid ${tradition.color}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{tradition.icon}</span>
                  <span className="font-bold text-gray-800">{tradition.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {AGE_BRACKETS.map((bracket) => {
                    const isRecommended = bracket.slug === recommendedBracketSlug;
                    return (
                      <Link
                        key={bracket.slug}
                        href={`/faith/${tradition.slug}/${bracket.slug}`}
                        className={`rounded-xl p-3 text-center font-semibold text-sm shadow-sm transition-all hover:scale-105 ${
                          isRecommended ? "text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                        style={
                          isRecommended
                            ? { backgroundColor: tradition.color, boxShadow: `0 0 0 4px ${tradition.color}40` }
                            : undefined
                        }
                      >
                        <div className="text-xl mb-1">{bracket.ageMin === 4 ? "🐣" : "🌿"}</div>
                        {bracket.label}
                        <div className="text-xs font-normal opacity-70">
                          {bracket.ageMin}-{bracket.ageMax} years
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
