export interface GutenbergBook {
  id: number;
  title: string;
  authors: { name: string; birth_year?: number; death_year?: number }[];
  subjects: string[];
  languages: string[];
  formats: Record<string, string>;
  download_count: number;
}

export interface GutenbergResult {
  count: number;
  results: GutenbergBook[];
}

export async function searchGutenberg(query: string, page = 1): Promise<GutenbergBook[]> {
  const params = new URLSearchParams({
    search: query,
    topic: "children",
    languages: "en",
    mime_type: "text/plain",
    page: String(page),
  });
  const res = await fetch(`https://gutendex.com/books/?${params}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data: GutenbergResult = await res.json();
  return data.results;
}

export function getGutenbergCover(book: GutenbergBook): string | null {
  return book.formats["image/jpeg"] ?? null;
}

export async function getGutenbergText(book: GutenbergBook): Promise<string | null> {
  const textUrl =
    book.formats["text/plain; charset=utf-8"] ??
    book.formats["text/plain; charset=us-ascii"] ??
    book.formats["text/plain"];
  if (!textUrl) return null;

  const res = await fetch(textUrl);
  if (!res.ok) return null;
  const text = await res.text();
  // Strip Project Gutenberg header/footer (typically before/after *** markers)
  const start = text.indexOf("*** START OF");
  const end = text.indexOf("*** END OF");
  if (start !== -1 && end !== -1) {
    return text.slice(text.indexOf("\n", start) + 1, end).trim();
  }
  return text.slice(0, 50000).trim(); // cap at 50k chars
}
