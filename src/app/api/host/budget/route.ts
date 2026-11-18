import { bodyOf, handle, requireHost, tokenOf } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";
import { ServiceError } from "@/lib/types";

export const PUT = (req: Request) =>
  handle(async () => {
    requireHost(req);
    const body = await bodyOf(req);
    return svc.setBudget(getStore(), body.budget);
  });
