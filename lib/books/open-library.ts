export interface OLBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  language?: string[];
  first_publish_year?: number;
}

export interface OLSearchResult {
  docs: OLBook[];
  numFound: number;
}

export async function searchOpenLibrary(query: string, page = 1): Promise<OLBook[]> {
  const params = new URLSearchParams({
    q: query,
    subject: "children",
    language: "eng",
    limit: "12",
    offset: String((page - 1) * 12),
    fields: "key,title,author_name,cover_i,subject,language,first_publish_year",
  });
  const res = await fetch(`https://openlibrary.org/search.json?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data: OLSearchResult = await res.json();
  return data.docs;
}

export async function getOpenLibraryText(workKey: string): Promise<string | null> {
  // Fetch description/first chapter text for TTS
  const res = await fetch(`https://openlibrary.org${workKey}.json`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const desc = data.description;
  if (!desc) return null;
  return typeof desc === "string" ? desc : (desc.value ?? null);
}

export function openLibraryCoverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
