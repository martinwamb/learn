// Shared between /admin/faith-review and /admin/cbc-review -- both review the
// same Lesson.content/activities JSON shape (the schema comment on ReligiousLesson
// says as much: "same shape as Lesson.content -- reuses the same player"), so one
// preview renderer and one card layout serves both, differing only in the meta
// line (tradition/ages vs grade/subject/unit) and which server actions get bound.
//
// Deliberately NOT components/lesson/LessonPlayer.tsx for the preview -- it
// unconditionally POSTs to /api/lessons/complete on its completion screen, which
// would record a real UserProgress row under the admin's own account for content
// that might still be edited or discarded. This is a plain read-only preview instead.

export type ContentBlock = Record<string, unknown> & { type?: string };
export type ActivityItem = Record<string, unknown>;

export interface DraftLessonData {
  id: string;
  title: string;
  objective: string;
  content: ContentBlock[];
  activities: ActivityItem[];
  funFact?: string | null;
}

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
    case "story-page":
      return (
        <div key={idx} className="text-sm text-gray-700 flex gap-2">
          <span className="text-gray-300 font-mono shrink-0">{idx + 1}.</span>
          <div>
            {String(block.text ?? "")}
            {block.imageQuery ? (
              <span className="text-gray-400 text-xs"> [🖼 {String(block.imageQuery)}]</span>
            ) : (
              <span className="text-red-500 text-xs"> [no imageQuery]</span>
            )}
          </div>
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

function renderActivity(act: ActivityItem, idx: number) {
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

interface DraftReviewCardProps {
  lesson: DraftLessonData;
  icon: string;
  metaLine: string;
  /**
   * What the content array is called in this queue. Stories store their prose as
   * `pages`, not `content`, so the label has to follow -- the form field name stays
   * "content" for all three queues so one card serves them all.
   */
  contentLabel?: string;
  publishAction: (formData: FormData) => Promise<void>;
  discardAction: (formData: FormData) => Promise<void>;
  editAndPublishAction: (formData: FormData) => Promise<void>;
}

export default function DraftReviewCard({
  lesson,
  icon,
  metaLine,
  contentLabel = "Content",
  publishAction,
  discardAction,
  editAndPublishAction,
}: DraftReviewCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <h2 className="font-bold text-gray-800">{lesson.title}</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">{metaLine}</p>

      <p className="text-sm text-gray-600 italic mb-3">{lesson.objective}</p>

      <div className="space-y-2 mb-3">{lesson.content.map((block, idx) => renderContentBlock(block, idx))}</div>
      <div className="mb-3">{lesson.activities.map((act, idx) => renderActivity(act, idx))}</div>
      {lesson.funFact && <p className="text-xs text-amber-600 mb-4">💡 {lesson.funFact}</p>}

      <div className="flex gap-2 mb-4">
        <form action={publishAction}>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
            Publish
          </button>
        </form>
        <form action={discardAction}>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm hover:bg-red-200">
            Discard
          </button>
        </form>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-orange-600">Edit before publishing</summary>
        <form action={editAndPublishAction} className="mt-3 space-y-3">
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
            <span className="text-xs text-gray-500">{contentLabel} (JSON)</span>
            <textarea
              name="content"
              defaultValue={JSON.stringify(lesson.content, null, 2)}
              rows={10}
              className="w-full border border-gray-200 rounded-lg p-2 text-xs font-mono"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">Activities (JSON)</span>
            <textarea
              name="activities"
              defaultValue={JSON.stringify(lesson.activities, null, 2)}
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
}
