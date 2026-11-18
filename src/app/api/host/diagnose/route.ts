import { handle, requireHost } from "@/lib/http";
import { redisConfig } from "@/lib/store";

/** Host only: which database settings exist (names only, never values). */
export const GET = (req: Request) =>
  handle(async () => {
    requireHost(req);
    return {
      database: redisConfig(process.env) ? "verbunden" : "nicht verbunden",
      names: Object.keys(process.env).filter((k) => /REDIS|UPSTASH|KV_|STORAGE|DATABASE/i.test(k)).sort(),
    };
  });
