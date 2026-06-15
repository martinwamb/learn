import { db } from "@/lib/db";
import Link from "next/link";
import AudioStatusBadge from "@/components/book/AudioStatusBadge";
import LibrarySearch from "@/components/book/LibrarySearch";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; q?: string }>;
}) {
  const { source, q } = await searchParams;

  // Saved books (already in our DB with audio pipeline)
  const savedBooks = await db.book.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const sources = [
    { key: "all", label: "All Sources", emoji: "📚" },
    { key: "african-storybook", label: "African Storybook", emoji: "🌍" },
    { key: "open-library", label: "Open Library", emoji: "🏛️" },
    { key: "gutenberg", label: "Gutenberg", emoji: "📜" },
    { key: "storyweaver", label: "Storyweaver", emoji: "🎨" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Story Library 📖</h1>
        <p className="text-gray-500">Books with Read Aloud narration for young learners</p>
      </div>

      <LibrarySearch defaultQ={q} defaultSource={source} sources={sources} />

      {/* Books already in system (with audio pipeline) */}
      {savedBooks.length > 0 && !q && (
        <div className="mb-8">
          <h2 className="font-bold text-gray-700 mb-4 text-lg">Available in Your Library</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {savedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/library/${book.id}`}
                className="bg-white rounded-2xl shadow hover:shadow-md transition-all hover:scale-[1.02] overflow-hidden"
              >
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-5xl">
                    📖
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="text-xs text-gray-400 mb-2">{book.author}</p>
                  )}
                  <AudioStatusBadge status={book.audioStatus} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
