export default function AudioStatusBadge({ status }: { status: string }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
        🎧 Ready to listen
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
        ⚙️ Generating audio...
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
        ❌ Audio unavailable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
      🕐 Audio coming soon
    </span>
  );
}
