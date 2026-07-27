import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AdminIndexPage() {
  if (!(await isAdminSession())) notFound();

  const [cbcDraftCount, faithDraftCount, storyDraftCount] = await Promise.all([
    db.lesson.count({ where: { status: "draft" } }),
    db.religiousLesson.count({ where: { status: "draft" } }),
    db.story.count({ where: { status: "draft" } }),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/cbc-review"
          className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100"
        >
          <div className="font-bold text-gray-800 text-lg">CBC Lesson Review</div>
          <p className="text-sm text-gray-400 mt-1">{cbcDraftCount} draft{cbcDraftCount === 1 ? "" : "s"} waiting</p>
        </Link>
        <Link
          href="/admin/faith-review"
          className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100"
        >
          <div className="font-bold text-gray-800 text-lg">Faith Lesson Review</div>
          <p className="text-sm text-gray-400 mt-1">{faithDraftCount} draft{faithDraftCount === 1 ? "" : "s"} waiting</p>
        </Link>
        <Link
          href="/admin/story-review"
          className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition-all hover:scale-[1.02] border border-gray-100"
        >
          <div className="font-bold text-gray-800 text-lg">Jina Story Review</div>
          <p className="text-sm text-gray-400 mt-1">{storyDraftCount} draft{storyDraftCount === 1 ? "" : "s"} waiting</p>
        </Link>
      </div>
    </div>
  );
}
