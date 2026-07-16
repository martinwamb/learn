"use client";

import { useEffect, useState } from "react";

interface Props {
  query: string;
  alt?: string;
  className?: string;
}

interface Result {
  query: string;
  url: string | null;
}

// Fetches a cached-or-freshly-looked-up picture for a lesson item via
// /api/media/image (Iconscout-backed). Matches this codebase's existing convention
// for externally-sourced images -- see components/book/LibrarySearch.tsx's book
// covers -- plain <img>, not next/image, since these are locally-cached files.
export default function MediaImage({ query, alt, className }: Props) {
  // Tagging the result with the query it belongs to (rather than resetting url/failed
  // synchronously when `query` changes) keeps every setState call inside the async
  // fetch callbacks -- calling setState directly in an effect body is disallowed here.
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/media/image?query=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(({ url }: { url: string }) => {
        if (!cancelled) setResult({ query, url });
      })
      .catch(() => {
        if (!cancelled) setResult({ query, url: null });
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const box = className ?? "w-40 h-40";
  const current = result?.query === query ? result : null;

  if (current && !current.url) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-2xl ${box}`}>
        <span className="text-5xl">🖼️</span>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse ${box}`}>
        <span className="text-3xl">⏳</span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={current.url!} alt={alt ?? query} className={`object-cover rounded-2xl ${box}`} />;
}
