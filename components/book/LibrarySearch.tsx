"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Source {
  key: string;
  label: string;
  emoji: string;
}

interface ExternalBook {
  externalId: string;
  source: string;
  title: string;
  author?: string;
  coverUrl?: string | null;
}

export default function LibrarySearch({
  defaultQ,
  defaultSource,
  sources,
}: {
  defaultQ?: string;
  defaultSource?: string;
  sources: Source[];
}) {
  const [q, setQ] = useState(defaultQ ?? "");
  const [selectedSource, setSelectedSource] = useState(defaultSource ?? "all");
  const [results, setResults] = useState<ExternalBook[]>([]);
  const [loading, startTransition] = useTransition();
  const [saving, setSaving] = useState<string | null>(null);
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const params = new URLSearchParams({ q, source: selectedSource });
      const res = await fetch(`/api/books/search?${params}`);
      const data = await res.json();
      setResults(data.books ?? []);
    });
  }

  async function handleAddBook(book: ExternalBook) {
    setSaving(book.externalId);
    try {
      const res = await fetch("/api/books/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      const { bookId } = await res.json();
      router.push(`/library/${bookId}`);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for a story..."
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-orange-400 focus:outline-none text-sm"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3 rounded-xl transition-colors"
          disabled={loading}
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* Source filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {sources.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedSource(s.key)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              selectedSource === s.key
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
            }`}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 mb-4">Search Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map((book) => (
              <button
                key={`${book.source}-${book.externalId}`}
                onClick={() => handleAddBook(book)}
                disabled={saving === book.externalId}
                className="bg-white rounded-2xl shadow hover:shadow-md transition-all hover:scale-[1.02] overflow-hidden text-left w-full"
              >
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverUrl} alt={book.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-5xl">
                    📖
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  {book.author && <p className="text-xs text-gray-400 mb-2">{book.author}</p>}
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {saving === book.externalId ? "Adding..." : "Add to library +"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
