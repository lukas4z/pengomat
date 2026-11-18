import { bodyOf, handle, requireHost, tokenOf } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";
import { ServiceError } from "@/lib/types";

export const POST = (req: Request) =>
  handle(async () => {
    requireHost(req);
    const body = await bodyOf(req);
    if (body.confirm !== "PENG") throw new ServiceError("invalid");
    return svc.reset(getStore());
  });
