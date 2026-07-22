// Fixed, not derived from distinct ReligiousUnit.ageMin/ageMax pairs in the DB --
// the entire Faith Stories curriculum (prisma/faith-curriculum/*.ts) is authored
// against exactly these two brackets. A fixed enum also surfaces a future
// curriculum data-entry typo (a unit with a mismatched ageMin/ageMax) as a unit
// silently excluded from both brackets, rather than hiding it behind a phantom
// third bracket card.
export interface AgeBracket {
  slug: string;
  label: string;
  ageMin: number;
  ageMax: number;
}

export const AGE_BRACKETS: AgeBracket[] = [
  { slug: "4-6", label: "Early Years", ageMin: 4, ageMax: 6 },
  { slug: "7-9", label: "Junior", ageMin: 7, ageMax: 9 },
];

export function findAgeBracket(slug: string): AgeBracket | undefined {
  return AGE_BRACKETS.find((b) => b.slug === slug);
}
