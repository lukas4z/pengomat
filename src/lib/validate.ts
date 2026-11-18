import { LIMITS, ServiceError } from "./types";

const bad = () => new ServiceError("invalid");
const len = (s: string) => Array.from(s).length;

export function parseName(v: unknown): string {
  if (typeof v !== "string") throw bad();
  const name = v.trim().replace(/\s+/g, " ");
  if (len(name) < LIMITS.nameMin || len(name) > LIMITS.nameMax) throw bad();
  return name;
}

export function parseWishes(v: unknown): string[] {
  if (!Array.isArray(v) || v.some((w) => typeof w !== "string")) throw bad();
  const wishes = (v as string[]).map((w) => w.trim()).filter(Boolean);
  if (wishes.length < 1 || wishes.length > LIMITS.wishesMax) throw bad();
  if (wishes.some((w) => len(w) > LIMITS.wishMax)) throw bad();
  return wishes;
}

export function parseBudget(v: unknown): string {
  if (typeof v !== "string") throw bad();
  const budget = v.trim();
  if (len(budget) > LIMITS.budgetMax) throw bad();
  return budget;
}
