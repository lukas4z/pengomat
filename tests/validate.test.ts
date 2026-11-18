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
  test("rejects four wishes", () => invalid(() => parseWishes(["a", "b", "c", "d"])));
  test("rejects a 201-character wish", () => invalid(() => parseWishes(["x".repeat(201)])));
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
    invalid(() => parseBudget("x".repeat(41)));
    invalid(() => parseBudget(15));
  });
});
