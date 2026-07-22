import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { publishDraft, discardDraft, editAndPublish } from "./actions";

type ContentBlock = Record<string, unknown> & { type?: string };

// Plain read-only preview -- deliberately NOT components/lesson/LessonPlayer.tsx,
// which unconditionally POSTs to /api/lessons/complete on its completion screen
// and would record a real UserProgress row under the admin's own account for
// content that might still be edited or discarded.
function renderContentBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case "introduction":
    case "explanation":
      return (
        <div key={idx} className="text-sm text-gray-700">
          <span className="font-semibold capitalize">{block.type}: </span>
          {String(block.text ?? "")}
          {block.example ? <div className="text-gray-500 italic mt-0.5">e.g. {String(block.example)}</div> : null}
        </div>
      );
    case "memory-verse":
      return (
        <div key={idx} className="text-sm text-purple-700 italic">
          &ldquo;{String(block.text ?? "")}&rdquo; — {String(block.reference ?? "")}
        </div>
      );
    case "activity":
    case "item":
    case "item-group":
      return (
        <div key={idx} className="text-sm text-gray-700">
          <span className="font-semibold">{block.instruction ? String(block.instruction) : block.type}</span>
          <ul className="list-disc list-inside text-gray-600">
            {Array.isArray(block.items) ? (block.items as unknown[]).map((it, i) => <li key={i}>{String(it)}</li>) : null}
          </ul>
        </div>
      );
    case "picture-match":
      return (
        <div key={idx} className="text-sm text-gray-700">
          <span className="font-semibold">{String(block.instruction ?? "Picture match")}</span>
          <ul className="list-disc list-inside text-gray-600">
            {Array.isArray(block.pictureItems)
              ? (block.pictureItems as Record<string, unknown>[]).map((it, i) => (
                  <li key={i}>
                    {String(it.label ?? "")}
                    {it.sound ? ` (${String(it.sound)})` : ""}
                  </li>
                ))
              : null}
          </ul>
        </div>
      );
    default:
      return (
        <pre key={idx} className="text-xs bg-gray-50 rounded p-2 overflow-x-auto">
          {JSON.stringify(block, null, 2)}
        </pre>
      );
  }
}

function renderActivity(act: Record<string, unknown>, idx: number) {
  return (
    <div key={idx} className="text-sm text-gray-700 border-t border-gray-100 pt-2 mt-2">
      <div className="font-medium">{String(act.question ?? act.sentence ?? act.type ?? "")}</div>
      {Array.isArray(act.options) ? (
        <div className="text-gray-500 text-xs">Options: {(act.options as unknown[]).map(String).join(", ")}</div>
      ) : null}
      {act.answer !== undefined ? <div className="text-green-600 text-xs">Answer: {String(act.answer)}</div> : null}
    </div>
  );
}

export default async function FaithReviewPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) notFound();

  const drafts = await db.religiousLesson.findMany({
    where: { status: "draft" },
    include: { unit: { include: { tradition: true } } },
    orderBy: [{ createdAt: "asc" }],
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Faith Lesson Review</h1>
        <p className="text-gray-400 text-sm">
          {drafts.length} draft{drafts.length === 1 ? "" : "s"} waiting for review
        </p>
      </div>

      {drafts.length === 0 && (
        <p className="text-gray-500">No drafts right now — check back after the next nightly run.</p>
      )}

      <div className="space-y-8">
        {drafts.map((lesson) => {
          const content = (lesson.content as ContentBlock[]) ?? [];
          const activities = (lesson.activities as Record<string, unknown>[]) ?? [];
          return (
            <div key={lesson.id} className="bg-white rounded-2xl shadow p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span>{lesson.unit.tradition.icon}</span>
                <h2 className="font-bold text-gray-800">{lesson.title}</h2>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                {lesson.unit.tradition.name} • Ages {lesson.unit.ageMin}-{lesson.unit.ageMax}
                {lesson.unit.scriptureRef ? ` • ${lesson.unit.scriptureRef}` : ""}
              </p>

              <p className="text-sm text-gray-600 italic mb-3">{lesson.objective}</p>

              <div className="space-y-2 mb-3">{content.map((block, idx) => renderContentBlock(block, idx))}</div>
              <div className="mb-3">{activities.map((act, idx) => renderActivity(act, idx))}</div>
              {lesson.funFact && <p className="text-xs text-amber-600 mb-4">💡 {lesson.funFact}</p>}

              <div className="flex gap-2 mb-4">
                <form action={publishDraft.bind(null, lesson.id)}>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                    Publish
                  </button>
                </form>
                <form action={discardDraft.bind(null, lesson.id)}>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200">
                    Discard
                  </button>
                </form>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-orange-600">Edit before publishing</summary>
                <form action={editAndPublish.bind(null, lesson.id)} className="mt-3 space-y-3">
                  <label className="block">
                    <span className="text-xs text-gray-500">Objective</span>
                    <textarea
                      name="objective"
                      defaultValue={lesson.objective}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500">Content (JSON)</span>
                    <textarea
                      name="content"
                      defaultValue={JSON.stringify(content, null, 2)}
                      rows={10}
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500">Activities (JSON)</span>
                    <textarea
                      name="activities"
                      defaultValue={JSON.stringify(activities, null, 2)}
                      rows={6}
                      className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs text-gray-500">Fun fact</span>
                    <textarea
                      name="funFact"
                      defaultValue={lesson.funFact ?? ""}
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                    />
                  </label>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600">
                    Save &amp; Publish
                  </button>
                </form>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
