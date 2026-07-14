import { db } from "@/lib/db";
import Link from "next/link";

export default async function FaithPage() {
  const traditions = await db.religiousTradition.findMany({
    include: { _count: { select: { units: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="text-orange-500 hover:underline text-sm">← Back</Link>
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Faith Stories 🙏</h1>
        <p className="text-gray-500">Stories and lessons drawn from scripture</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {traditions.map((tradition) => (
          <Link
            key={tradition.id}
            href={`/faith/${tradition.slug}`}
            className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100"
            style={{ borderLeft: `5px solid ${tradition.color}` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{tradition.icon}</span>
              <div>
                <h2 className="font-bold text-gray-800 text-lg leading-tight">{tradition.name}</h2>
                <p className="text-sm text-gray-400">{tradition._count.units} units</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">Tap to explore stories →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
