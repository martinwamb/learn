const ICONSCOUT_CLIENT_ID = process.env.ICONSCOUT_CLIENT_ID;

interface IconscoutItem {
  name: string;
  urls: { thumb: string };
}

interface IconscoutSearchResponse {
  response?: { items?: { data?: IconscoutItem[] } };
}

const STOPWORDS = new Set(["a", "an", "the", "with", "and", "in", "on", "of", "for", "to"]);

function singularize(word: string): string {
  return word.endsWith("s") && word.length > 3 ? word.slice(0, -1) : word;
}

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map(singularize);
}

// Iconscout's free tier has a real coverage gap for common single-object nouns (e.g.
// "Sun" and "Elephant" both surfaced completely unrelated top "relevant" results in
// testing -- a stick figure and a "Followers" icon, respectively). Rather than trust
// per_page=1 blindly, fetch a few more candidates and only accept one whose name
// actually shares a content word with the query -- otherwise the caller's existing
// "no image found" placeholder is a far better outcome than a wrong picture in a
// kids' app.
function isRelevant(itemName: string, query: string): boolean {
  const nameWords = contentWords(itemName);
  return contentWords(query).some((qw) => nameWords.includes(qw));
}

// price=free restricts to freely-usable (non-credit) items -- this app's lookups
// happen unattended (nightly worker + on-demand lesson/book rendering), so it
// should never spend paid download credits.
export async function searchIllustration(query: string): Promise<string | null> {
  if (!ICONSCOUT_CLIENT_ID) return null;

  const params = new URLSearchParams({
    query,
    asset: "illustration",
    price: "free",
    per_page: "10",
  });
  const res = await fetch(`https://api.iconscout.com/v3/search?${params}`, {
    headers: { "Client-ID": ICONSCOUT_CLIENT_ID },
  });
  if (!res.ok) return null;

  const data: IconscoutSearchResponse = await res.json();
  const items = data.response?.items?.data ?? [];
  const match = items.find((item) => isRelevant(item.name, query));
  return match?.urls?.thumb ?? null;
}
