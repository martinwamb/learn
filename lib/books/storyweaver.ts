export interface SWStory {
  id: number;
  title: string;
  author: string;
  illustrator?: string;
  level: string;
  language: string;
  cover_image: string;
  reading_level_label?: string;
}

export interface SWResponse {
  stories: SWStory[];
  meta: { total_count: number };
}

export interface SWStoryDetail {
  id: number;
  title: string;
  pages: { page_number: number; text: string; image_url?: string }[];
}

const SW_BASE = "https://storyweaver.org.in/api/v1";

export async function searchStoryweaver(
  query = "",
  language = "English",
  page = 1
): Promise<SWStory[]> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: "12",
    language,
    category: "Picture Book",
    ...(query ? { search_query: query } : {}),
  });
  try {
    const res = await fetch(`${SW_BASE}/stories?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data: SWResponse = await res.json();
    return data.stories ?? [];
  } catch {
    return [];
  }
}

export async function getStoryweaverText(storyId: number): Promise<string | null> {
  try {
    const res = await fetch(`${SW_BASE}/stories/${storyId}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data: SWStoryDetail = await res.json();
    if (!data.pages?.length) return null;
    return data.pages
      .sort((a, b) => a.page_number - b.page_number)
      .map((p) => p.text)
      .join("\n\n")
      .trim();
  } catch {
    return null;
  }
}
