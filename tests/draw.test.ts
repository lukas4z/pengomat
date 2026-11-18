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

describe("drawChain with groups (people entered on the same phone)", () => {
  const conflicts = (map: Record<string, string>, groups: Record<string, string>) => Object.entries(map).filter(([a, b]) => groups[a] && groups[a] === groups[b]).length;
  const valid = (map: Record<string, string>, ids: string[]) => {
    expect(Object.keys(map).sort()).toEqual([...ids].sort());
    expect(Object.values(map).sort()).toEqual([...ids].sort());
    for (const id of ids) expect(map[id]).not.toBe(id);
  };

  test("nobody draws someone from their own group when that is possible", () => {
    const ids = ["a1", "a2", "a3", "a4", "b1", "b2", "c1", "d1"];
    const groups = { a1: "A", a2: "A", a3: "A", a4: "A", b1: "B", b2: "B" };
    for (let run = 0; run < 100; run++) {
      const map = drawChain(ids, undefined, groups);
      valid(map, ids);
      expect(conflicts(map, groups)).toBe(0);
    }
  });

  test("works at the limit: a family that is exactly half of everyone", () => {
    const ids = ["a1", "a2", "x", "y"];
    const groups = { a1: "A", a2: "A" };
    for (let run = 0; run < 100; run++) expect(conflicts(drawChain(ids, undefined, groups), groups)).toBe(0);
  });

  test("still draws, with as few clashes as possible, when a family is more than half", () => {
    const ids = ["a1", "a2", "a3", "x"];
    const groups = { a1: "A", a2: "A", a3: "A" };
    for (let run = 0; run < 50; run++) {
      const map = drawChain(ids, undefined, groups);
      valid(map, ids);
      expect(conflicts(map, groups)).toBe(2);
    }
  });

  test("people without a group are unaffected", () => {
    const ids = ["p", "q", "r"];
    valid(drawChain(ids, undefined, {}), ids);
  });
});
