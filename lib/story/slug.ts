// Stories are addressed by a readable slug plus an explicit ?storyId=, exactly like
// lessons (`lesson-3?lessonId=...`). The slug is cosmetic -- the id is what actually
// resolves the row -- so it never needs to be unique or stable.
export function storySlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      // Strip combining accent marks so the URL stays ASCII.
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "story"
  );
}
