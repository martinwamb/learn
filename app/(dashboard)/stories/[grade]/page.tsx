import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { READING_LEVELS, levelForGradeCode } from "@/lib/story/reading-levels";
import { asStoryPages } from "@/lib/story/to-lesson-data";
import { storySlug } from "@/lib/story/slug";

export default async function StoriesByGrade({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  const gradeCode = grade.toUpperCase();
  const session = await auth();

  const gradeData = await db.grade.findUnique({ where: { code: gradeCode } });
  if (!gradeData) notFound();

  const stories = await db.story.findMany({
    // The same guard the lesson list uses: without it, an unreviewed AI draft would be
    // visible to a child the moment the nightly worker created it.
    where: { status: "published", unit: { subject: { gradeId: gradeData.id } } },
    include: { unit: { include: { subject: true } } },
    orderBy: [{ unit: { subjectId: "asc" } }, { sequence: "asc" }],
  });

  const completedIds = new Set(
    (
      await db.userProgress.findMany({
        where: { userId: session!.user!.id, completed: true, type: "story" },
        select: { storyId: true },
      })
    )
      .map((p) => p.storyId)
      .filter(Boolean) as string[]
  );

  const level = READING_LEVELS[levelForGradeCode(gradeCode)];

  // Group by subject so a child sees stories next to the lessons they belong with.
  const bySubject = new Map<string, { icon: string; name: string; stories: typeof stories }>();
  for (const story of stories) {
    const key = story.unit.subject.slug;
    if (!bySubject.has(key)) {
      bySubject.set(key, { icon: story.unit.subject.icon, name: story.unit.subject.name, stories: [] });
    }
    bySubject.get(key)!.stories.push(story);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Jina&rsquo;s Stories 🦒</h1>
        <p className="text-gray-500">
          {gradeData.name} · {level.label} · {stories.length} {stories.length === 1 ? "story" : "stories"} to read
        </p>
      </div>

      {stories.length === 0 && (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          No stories here yet — check back soon!
        </div>
      )}

      <div className="space-y-6">
        {[...bySubject.entries()].map(([slug, group]) => (
          <div key={slug}>
            <h2 className="flex items-center gap-2 font-bold text-gray-700 mb-3">
              <span className="text-2xl">{group.icon}</span>
              {group.name}
            </h2>
            <div className="space-y-2">
              {group.stories.map((story) => {
                const done = completedIds.has(story.id);
                const pageCount = asStoryPages(story.pages).length;
                return (
                  <Link
                    key={story.id}
                    href={`/stories/${gradeCode}/${storySlug(story.title)}?storyId=${story.id}`}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                      done
                        ? "bg-green-50 border border-green-200"
                        : "bg-white hover:bg-orange-50 border border-gray-100 hover:border-orange-200 shadow-sm"
                    }`}
                  >
                    <span className="text-2xl">{done ? "✅" : "📖"}</span>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{story.title}</div>
                      <div className="text-xs text-gray-400">
                        Unit {story.unit.sequence}: {story.unit.title} · {pageCount} pages · {story.duration} min
                      </div>
                    </div>
                    {story.source === "ai-generated" && (
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
