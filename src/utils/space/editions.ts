export interface SpaceEditionSummary {
  year: number;
  title: string;
  period: string;
  description: string;
  href: `/space/${number}`;
  current: boolean;
}

export const SPACE_EDITIONS = [
  {
    year: 2026,
    title: "Space 2026",
    period: "2025.08—2026.08",
    description: "Learning, film, music, development, and direction across one year of attention.",
    href: "/space/2026",
    current: true,
  },
] as const satisfies readonly SpaceEditionSummary[];

export function getCurrentSpaceEdition(
  editions: readonly SpaceEditionSummary[] = SPACE_EDITIONS,
): SpaceEditionSummary {
  const currentEditions = editions.filter((edition) => edition.current);
  if (currentEditions.length !== 1) {
    throw new Error(`Space requires exactly one current edition; found ${currentEditions.length}.`);
  }
  return currentEditions[0];
}
