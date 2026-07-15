export interface GutenbergBook {
  id: number;
  title: string;
  author?: string;
  coverUrl: string | null;
}

const RESULTS_PER_PAGE = 25;

// gutendex.com (the JSON API this used to call) is Cloudflare-blocked (403) from the
// server's IP, but www.gutenberg.org itself is not -- its own HTML search and the
// predictable raw-text file path (see extractText below) work fine, so this scrapes
// gutenberg.org directly instead of going through the dead API layer.
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&apos;": "'",
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&apos;/g, (entity) => HTML_ENTITIES[entity]);
}

export async function searchGutenberg(query: string, page = 1): Promise<GutenbergBook[]> {
  const params = new URLSearchParams({
    query,
    start_index: String((page - 1) * RESULTS_PER_PAGE + 1),
  });
  try {
    const res = await fetch(`https://www.gutenberg.org/ebooks/search/?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const books: GutenbergBook[] = [];
    for (const block of html.matchAll(/<li class="booklink">([\s\S]*?)<\/li>/g)) {
      const item = block[1];
      const idMatch = item.match(/href="\/ebooks\/(\d+)"/);
      const titleMatch = item.match(/<span class="title">([^<]+)<\/span>/);
      const authorMatch = item.match(/<span class="subtitle">([^<]+)<\/span>/);
      const coverMatch = item.match(/<img class="cover-thumb" src="([^"]+)"/);
      if (!idMatch || !titleMatch) continue;

      books.push({
        id: Number(idMatch[1]),
        title: decodeEntities(titleMatch[1]),
        author: authorMatch ? decodeEntities(authorMatch[1]) : undefined,
        coverUrl: coverMatch ? `https://www.gutenberg.org${coverMatch[1]}` : null,
      });
    }
    return books;
  } catch {
    return [];
  }
}

async function extractText(id: number): Promise<string | null> {
  const res = await fetch(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`);
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

export async function getGutenbergText(book: GutenbergBook): Promise<string | null> {
  return extractText(book.id);
}

// By-id variant, for callers (the book-save flow) that only have the externalId on
// hand, not the full search-result object.
export async function getGutenbergTextById(id: string): Promise<string | null> {
  return extractText(Number(id));
}
