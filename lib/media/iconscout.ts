const ICONSCOUT_CLIENT_ID = process.env.ICONSCOUT_CLIENT_ID;

interface IconscoutItem {
  urls: { thumb: string };
}

interface IconscoutSearchResponse {
  response?: { items?: { data?: IconscoutItem[] } };
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
    per_page: "1",
  });
  const res = await fetch(`https://api.iconscout.com/v3/search?${params}`, {
    headers: { "Client-ID": ICONSCOUT_CLIENT_ID },
  });
  if (!res.ok) return null;

  const data: IconscoutSearchResponse = await res.json();
  const item = data.response?.items?.data?.[0];
  return item?.urls?.thumb ?? null;
}
