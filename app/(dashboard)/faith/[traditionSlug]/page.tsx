import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AGE_BRACKETS } from "@/lib/faith-age-brackets";

export default async function TraditionPage({
  params,
}: {
  params: Promise<{ traditionSlug: string }>;
}) {
  const { traditionSlug } = await params;

  const tradition = await db.religiousTradition.findUnique({
    where: { slug: traditionSlug },
  });

  if (!tradition) notFound();

  // Count published stories per bracket so a bracket with nothing published yet
  // can still be shown (with a "coming soon" count) rather than silently hidden.
  const bracketCounts = await Promise.all(
    AGE_BRACKETS.map((bracket) =>
      db.religiousLesson.count({
        where: {
          status: "published",
          unit: { traditionId: tradition.id, ageMin: bracket.ageMin, ageMax: bracket.ageMax },
        },
      })
    )
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
            <p className="text-gray-400">Choose an age group</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {AGE_BRACKETS.map((bracket, idx) => (
          <Link
            key={bracket.slug}
            href={`/faith/${traditionSlug}/${bracket.slug}`}
            className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100"
            style={{ borderLeft: `5px solid ${tradition.color}` }}
          >
            <h2 className="font-bold text-gray-800 text-lg leading-tight">{bracket.label}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Ages {bracket.ageMin}-{bracket.ageMax} • {bracketCounts[idx]} {bracketCounts[idx] === 1 ? "story" : "stories"}
            </p>
            <div className="text-sm text-gray-500 mt-3">Tap to explore →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
