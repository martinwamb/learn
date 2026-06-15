import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "@/components/book/AudioPlayer";
import AudioStatusBadge from "@/components/book/AudioStatusBadge";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const book = await db.book.findUnique({ where: { id } });
  if (!book) notFound();

  const sourceLabel: Record<string, string> = {
    "open-library": "Open Library",
    "gutenberg": "Project Gutenberg",
    "african-storybook": "African Storybook Project",
    "storyweaver": "Storyweaver",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/library" className="text-orange-500 hover:underline text-sm">
        ← Library
      </Link>

      <div className="mt-6 flex gap-5 mb-8">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-28 h-40 object-cover rounded-2xl shadow-lg flex-shrink-0"
          />
        ) : (
          <div className="w-28 h-40 bg-gradient-to-br from-orange-100 to-purple-100 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            📖
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 leading-tight mb-1">{book.title}</h1>
          {book.author && <p className="text-gray-500 mb-2">by {book.author}</p>}
          <p className="text-xs text-gray-400 mb-3">Source: {sourceLabel[book.source] ?? book.source}</p>
          <AudioStatusBadge status={book.audioStatus} />
        </div>
      </div>

      {/* Audio player */}
      {book.audioStatus === "ready" && book.audioPath ? (
        <div className="mb-8">
          <AudioPlayer audioPath={book.audioPath} title={book.title} />
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-8 text-center">
          <div className="text-4xl mb-3">🎙️</div>
          <p className="font-semibold text-purple-800 mb-1">Read Aloud Coming Soon</p>
          <p className="text-sm text-purple-600">
            Our narrator voices are being prepared for this story. Audio is generated nightly.
            Check back tomorrow!
          </p>
        </div>
      )}

      {/* Book text */}
      {book.text ? (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-bold text-gray-700 mb-4">Read the Story</h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {book.text.slice(0, 5000)}
            {book.text.length > 5000 && (
              <p className="text-gray-400 italic mt-4">... (full text available in audio)</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400">
          <p>Story text will be loaded when audio is generated.</p>
        </div>
      )}
    </div>
  );
}
