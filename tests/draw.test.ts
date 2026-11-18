import { describe, expect, test } from "vitest";
import { drawChain } from "@/lib/draw";

describe("drawChain", () => {
  test("gives everyone exactly one other person, as one closed chain", () => {
    for (let n = 3; n <= 50; n++) {
      const ids = Array.from({ length: n }, (_, i) => `p${i}`);
      for (let run = 0; run < 20; run++) {
        const map = drawChain(ids);
        expect(Object.keys(map).sort()).toEqual([...ids].sort());
        expect(Object.values(map).sort()).toEqual([...ids].sort());
        for (const id of ids) expect(map[id]).not.toBe(id);
        const seen = new Set<string>();
        let cur = ids[0];
        while (!seen.has(cur)) {
          seen.add(cur);
          cur = map[cur];
        }
        expect(seen.size).toBe(n);
      }
    }
  });

  test("does not always produce the same order", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `p${i}`);
    const results = new Set(Array.from({ length: 10 }, () => JSON.stringify(drawChain(ids))));
    expect(results.size).toBeGreaterThan(1);
  });

  test("refuses fewer than two people", () => {
    expect(() => drawChain(["a"])).toThrow();
    expect(() => drawChain([])).toThrow();
  });
});
