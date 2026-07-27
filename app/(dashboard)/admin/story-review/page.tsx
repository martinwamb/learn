import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/admin-auth";
import { notFound } from "next/navigation";
import DraftReviewCard, { type ContentBlock, type ActivityItem } from "@/components/admin/DraftReviewCard";
import { asStoryPages } from "@/lib/story/to-lesson-data";
import { READING_LEVELS, isReadingLevel } from "@/lib/story/reading-levels";
import { publishDraft, discardDraft, editAndPublish } from "./actions";

export default async function StoryReviewPage() {
  if (!(await isAdminSession())) notFound();

  const drafts = await db.story.findMany({
    where: { status: "draft" },
    include: { unit: { include: { subject: { include: { grade: true } } } } },
    orderBy: [{ createdAt: "asc" }],
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Jina Story Review</h1>
        <p className="text-gray-400 text-sm">
          {drafts.length} draft{drafts.length === 1 ? "" : "s"} waiting for review
        </p>
      </div>

      {drafts.length === 0 && (
        <p className="text-gray-500">No drafts right now — check back after the next nightly run.</p>
      )}

      <div className="space-y-8">
        {drafts.map((story) => {
          const pages = asStoryPages(story.pages);
          const rule = isReadingLevel(story.readingLevel) ? READING_LEVELS[story.readingLevel] : null;
          return (
            <DraftReviewCard
              key={story.id}
              icon={story.unit.subject.icon}
              metaLine={
                `${story.unit.subject.grade.name} • ${story.unit.subject.name} • Unit ${story.unit.sequence}: ${story.unit.title}` +
                (rule ? ` • ${rule.label} (${pages.length}/${rule.pages} pages)` : ` • ${pages.length} pages`) +
                (story.vocabulary.length ? ` • words: ${story.vocabulary.join(", ")}` : "")
              }
              contentLabel="Pages"
              lesson={{
                id: story.id,
                title: story.title,
                objective: story.objective,
                // Presented as story-page blocks so the card's existing renderer shows
                // the prose and flags any page missing an imageQuery.
                content: pages.map((p) => ({ type: "story-page", ...p })) as ContentBlock[],
                activities: (story.activities as ActivityItem[]) ?? [],
                funFact: story.funFact,
              }}
              publishAction={publishDraft.bind(null, story.id)}
              discardAction={discardDraft.bind(null, story.id)}
              editAndPublishAction={editAndPublish.bind(null, story.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
