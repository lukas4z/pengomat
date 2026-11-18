import { randomInt } from "node:crypto";

/**
 * Shuffle everyone into one closed chain: each person gives to the next, the last to the first.
 * Nobody draws themselves and everybody receives exactly once.
 */
export function drawChain(ids: string[], randInt: (n: number) => number = randomInt): Record<string, string> {
  if (ids.length < 2) throw new Error("drawChain needs at least two people");
  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const map: Record<string, string> = {};
  order.forEach((id, i) => {
    map[id] = order[(i + 1) % order.length];
  });
  return map;
}
