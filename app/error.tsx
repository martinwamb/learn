"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center space-y-6">
      <div className="text-6xl">🦒💭</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">Oops, something went wrong!</h1>
        <p className="text-gray-500 max-w-xs mx-auto">
          Jina had a little trouble with that page. Let&apos;s try again.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => unstable_retry()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-8 rounded-2xl transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
