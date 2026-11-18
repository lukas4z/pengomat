import { bodyOf, handle, requireHost, tokenOf } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";
import { ServiceError } from "@/lib/types";

export const GET = (req: Request) =>
  handle(async () => {
    requireHost(req);
    return svc.hostView(getStore());
  });
