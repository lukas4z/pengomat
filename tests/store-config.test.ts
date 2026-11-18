import { describe, expect, test } from "vitest";
import { redisConfig } from "@/lib/store";

describe("redisConfig", () => {
  test("reads the Upstash names", () => {
    expect(redisConfig({ UPSTASH_REDIS_REST_URL: "https://a", UPSTASH_REDIS_REST_TOKEN: "t" })).toEqual({ url: "https://a", token: "t" });
  });
  test("reads the Vercel KV names and ignores the read-only token", () => {
    expect(redisConfig({ KV_REST_API_URL: "https://a", KV_REST_API_READ_ONLY_TOKEN: "ro", KV_REST_API_TOKEN: "t", KV_URL: "rediss://x" })).toEqual({ url: "https://a", token: "t" });
  });
  test("reads names that carry a custom prefix from the Vercel integration", () => {
    expect(redisConfig({ PENGOMAT_KV_REST_API_URL: "https://a", PENGOMAT_KV_REST_API_TOKEN: "t" })).toEqual({ url: "https://a", token: "t" });
    expect(redisConfig({ STORAGE_UPSTASH_REDIS_REST_URL: "https://b", STORAGE_UPSTASH_REDIS_REST_TOKEN: "u" })).toEqual({ url: "https://b", token: "u" });
  });
  test("is null when nothing or only half is configured", () => {
    expect(redisConfig({})).toBeNull();
    expect(redisConfig({ KV_REST_API_URL: "https://a" })).toBeNull();
    expect(redisConfig({ KV_REST_API_URL: "", KV_REST_API_TOKEN: "t" })).toBeNull();
  });
});
