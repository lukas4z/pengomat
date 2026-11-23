import { describe, expect, test } from "vitest";
import { parseBudget, parseName, parseWishes } from "@/lib/validate";

const invalid = (fn: () => unknown) => expect(fn).toThrowError("invalid");

describe("parseName", () => {
  test("trims surrounding whitespace", () => expect(parseName("  Mia  ")).toBe("Mia"));
  test("keeps emoji and markup verbatim", () => expect(parseName("<b>Mia</b> 🎄")).toBe("<b>Mia</b> 🎄"));
  test("rejects a one-character name", () => invalid(() => parseName("A")));
  test("rejects a 31-character name", () => invalid(() => parseName("x".repeat(31))));
  test("accepts a 30-character name", () => expect(parseName("x".repeat(30))).toHaveLength(30));
  test("rejects non-strings", () => {
    invalid(() => parseName(undefined));
    invalid(() => parseName(42));
  });
});

describe("parseWishes", () => {
  test("trims and drops empty entries", () => expect(parseWishes(["", " Socken ", ""])).toEqual(["Socken"]));
  test("rejects an empty list", () => invalid(() => parseWishes([])));
  test("rejects a list of only blanks", () => invalid(() => parseWishes(["  ", ""])));
  test("accepts a long wish of 2000 characters and ten wishes", () => {
    expect(parseWishes(["x".repeat(2000)])[0]).toHaveLength(2000);
    expect(parseWishes(Array.from({ length: 10 }, (_, i) => `Wunsch ${i}`))).toHaveLength(10);
  });
  test("rejects eleven wishes", () => invalid(() => parseWishes(Array.from({ length: 11 }, (_, i) => `Wunsch ${i}`))));
  test("rejects a wish over 2000 characters", () => invalid(() => parseWishes(["x".repeat(2001)])));
  test("rejects non-arrays and non-string entries", () => {
    invalid(() => parseWishes("Socken"));
    invalid(() => parseWishes([1]));
    invalid(() => parseWishes(null));
  });
});

describe("parseBudget", () => {
  test("trims and allows empty", () => {
    expect(parseBudget(" 15 € ")).toBe("15 €");
    expect(parseBudget("")).toBe("");
  });
  test("rejects more than 40 characters and non-strings", () => {
    expect(parseBudget("x".repeat(100))).toHaveLength(100);
    invalid(() => parseBudget("x".repeat(101)));
    invalid(() => parseBudget(15));
  });
});
