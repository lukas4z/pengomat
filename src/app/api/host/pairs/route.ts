import { handle, requireHost } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";

/** Host only, on request: who gives to whom (for sorting out problems). */
export const GET = (req: Request) =>
  handle(async () => {
    requireHost(req);
    return svc.pairs(getStore());
  });
