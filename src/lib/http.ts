import { createHash, timingSafeEqual } from "node:crypto";
import { ServiceError, type ErrorCode } from "./types";

const STATUS: Record<ErrorCode, number> = {
  invalid: 400,
  unauthorized: 401,
  not_found: 404,
  name_taken: 409,
  closed: 409,
  full: 409,
  too_few: 409,
  already_drawn: 409,
  no_database: 503,
};

const digest = (s: string) => createHash("sha256").update(s).digest();

export function isHostKey(candidate: string | null | undefined): boolean {
  const key = process.env.HOST_KEY;
  if (!key || !candidate) return false;
  return timingSafeEqual(digest(candidate), digest(key));
}

export function requireHost(req: Request) {
  if (!isHostKey(req.headers.get("x-host-key"))) throw new ServiceError("not_found");
}

export const tokenOf = (req: Request) => req.headers.get("x-peng-token") ?? "";

export async function bodyOf(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  } catch {}
  throw new ServiceError("invalid");
}

export async function handle(fn: () => Promise<unknown>): Promise<Response> {
  try {
    return Response.json(await fn(), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e instanceof ServiceError) return Response.json({ error: e.code }, { status: STATUS[e.code] });
    console.error(e);
    return Response.json({ error: "server" }, { status: 500 });
  }
}
