import { randomInt } from "node:crypto";

type Rand = (n: number) => number;

function shuffled<T>(items: T[], randInt: Rand): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** How many people in this circle would give to someone from their own group. */
function clashes(order: string[], groups: Record<string, string | undefined>): number {
  let n = 0;
  for (let i = 0; i < order.length; i++) {
    const a = groups[order[i]];
    if (a && a === groups[order[(i + 1) % order.length]]) n++;
  }
  return n;
}

/**
 * Shuffle everyone into one closed chain: each person gives to the next, the last to the first.
 * Nobody draws themselves and everybody receives exactly once.
 * `groups` marks people who belong together (entered on the same phone): they do not draw each other
 * as long as that is possible, i.e. while no group is more than half of everyone. Otherwise the
 * chain with the fewest such pairs is used.
 */
export function drawChain(ids: string[], randInt: Rand = randomInt, groups: Record<string, string | undefined> = {}): Record<string, string> {
  if (ids.length < 2) throw new Error("drawChain needs at least two people");
  let best = shuffled(ids, randInt);
  let bestClashes = clashes(best, groups);
  for (let attempt = 0; attempt < 3000 && bestClashes > 0; attempt++) {
    const order = shuffled(ids, randInt);
    const c = clashes(order, groups);
    if (c < bestClashes) [best, bestClashes] = [order, c];
  }
  if (bestClashes > 0) {
    // Random tries did not find a clean circle: spread the groups out, biggest first, over every other seat.
    const buckets = new Map<string, string[]>();
    for (const id of shuffled(ids, randInt)) {
      const key = groups[id] ?? `solo:${id}`;
      buckets.set(key, [...(buckets.get(key) ?? []), id]);
    }
    const line = [...buckets.values()].sort((a, b) => b.length - a.length).flat();
    const seats = [...ids.keys()].filter((i) => i % 2 === 0).concat([...ids.keys()].filter((i) => i % 2 === 1));
    const spread: string[] = [];
    line.forEach((id, i) => (spread[seats[i]] = id));
    const c = clashes(spread, groups);
    if (c < bestClashes) [best, bestClashes] = [spread, c];
  }
  const map: Record<string, string> = {};
  best.forEach((id, i) => {
    map[id] = best[(i + 1) % best.length];
  });
  return map;
}
