// Sound-match items combine a subject and its onomatopoeia in one string
// (e.g. "Drum — boom boom!") -- split on the delimiter and keep only the
// subject, which is what actually makes a sensible image/sound search term.
const DELIMITERS = [" — ", " – ", " - ", ":", "("];

export function deriveMediaQuery(item: string): string {
  let head = item;
  for (const d of DELIMITERS) {
    const idx = head.indexOf(d);
    if (idx !== -1) head = head.slice(0, idx);
  }
  return head.replace(/[!?.,]/g, "").trim().toLowerCase();
}

// Defense-in-depth on top of Pexels/Freesound's own platform moderation --
// queries only ever come from AI-generated or hand-authored lesson content, never
// raw end-user input, but this catches anything that slips through generation.
const DENYLIST = [
  "sex", "sexy", "nude", "naked", "porn", "erotic", "fetish", "kill", "murder",
  "suicide", "gore", "blood", "gun", "weapon", "drug", "alcohol", "cigarette",
  "hate", "nazi", "terror",
];

export function isQuerySafe(query: string): boolean {
  const q = query.toLowerCase();
  return !DENYLIST.some((word) => q.includes(word));
}
