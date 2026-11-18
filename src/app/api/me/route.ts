import { bodyOf, handle, requireHost, tokenOf } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";
import { ServiceError } from "@/lib/types";

export const GET = (req: Request) => handle(() => svc.getMe(getStore(), tokenOf(req)));

export const PATCH = (req: Request) =>
  handle(async () => {
    const body = await bodyOf(req);
    return svc.updateWishes(getStore(), tokenOf(req), body.wishes);
  });
