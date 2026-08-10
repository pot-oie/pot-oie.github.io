export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

export function selectDiverseRandom<T>(
  items: readonly T[],
  count: number,
  limits: Array<{ key: (item: T) => string; max: number }>,
  random: () => number = Math.random,
): T[] {
  const shuffled = shuffle(items, random);
  const selected: T[] = [];
  const counters = limits.map(() => new Map<string, number>());

  for (const item of shuffled) {
    const keys = limits.map((limit) => limit.key(item));
    if (limits.some((limit, index) => (counters[index].get(keys[index]) ?? 0) >= limit.max)) continue;
    selected.push(item);
    keys.forEach((key, index) => counters[index].set(key, (counters[index].get(key) ?? 0) + 1));
    if (selected.length === count) return selected;
  }

  for (const item of shuffled) {
    if (!selected.includes(item)) selected.push(item);
    if (selected.length === count) break;
  }
  return selected;
}
