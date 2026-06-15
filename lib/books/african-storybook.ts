export interface ASBStory {
  id: string;
  title: string;
  language: string;
  reading_level: string;
  cover_image?: string;
  author?: string;
  pages?: ASBPage[];
}

export interface ASBPage {
  image_url?: string;
  text: string;
}

const ASB_BASE = "https://www.africanstorybook.org";

export async function searchAfricanStorybook(
  query = "",
  language = "English",
  level?: string
): Promise<ASBStory[]> {
  const params = new URLSearchParams({
    search: query,
    language,
    ...(level ? { reading_level: level } : {}),
  });
  try {
    const res = await fetch(`${ASB_BASE}/api/books?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.books ?? []);
  } catch {
    return [];
  }
}

export async function getAfricanStorybookText(storyId: string): Promise<string | null> {
  try {
    const res = await fetch(`${ASB_BASE}/api/books/${storyId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const story: ASBStory = await res.json();
    if (!story.pages?.length) return null;
    return story.pages.map((p) => p.text).join("\n\n").trim();
  } catch {
    return null;
  }
}
