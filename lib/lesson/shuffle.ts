// Deterministic (seeded) shuffle -- not Math.random(): a pure function of its inputs,
// so it's safe to call directly during render (e.g. inside useMemo) without tripping
// React's "components must be pure" rule.
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
