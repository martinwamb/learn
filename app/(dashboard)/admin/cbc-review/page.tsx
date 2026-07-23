import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import DraftReviewCard, { type ContentBlock, type ActivityItem } from "@/components/admin/DraftReviewCard";
import { publishDraft, discardDraft, editAndPublish } from "./actions";

export default async function CbcReviewPage() {
  if (!(await isAdminSession())) notFound();

  const drafts = await db.lesson.findMany({
    where: { status: "draft" },
    include: { unit: { include: { subject: { include: { grade: true } } } } },
    orderBy: [{ createdAt: "asc" }],
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">CBC Lesson Review</h1>
        <p className="text-gray-400 text-sm">
          {drafts.length} draft{drafts.length === 1 ? "" : "s"} waiting for review
        </p>
      </div>

      {drafts.length === 0 && (
        <p className="text-gray-500">No drafts right now — check back after the next nightly run.</p>
      )}

      <div className="space-y-8">
        {drafts.map((lesson) => (
          <DraftReviewCard
            key={lesson.id}
            icon={lesson.unit.subject.icon}
            metaLine={`${lesson.unit.subject.grade.name} • ${lesson.unit.subject.name} • Unit ${lesson.unit.sequence}: ${lesson.unit.title}`}
            lesson={{
              id: lesson.id,
              title: lesson.title,
              objective: lesson.objective,
              content: (lesson.content as ContentBlock[]) ?? [],
              activities: (lesson.activities as ActivityItem[]) ?? [],
              funFact: lesson.funFact,
            }}
            publishAction={publishDraft.bind(null, lesson.id)}
            discardAction={discardDraft.bind(null, lesson.id)}
            editAndPublishAction={editAndPublish.bind(null, lesson.id)}
          />
        ))}
      </div>
    </div>
  );
}
