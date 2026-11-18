import { bodyOf, handle, requireHost, tokenOf } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";
import { ServiceError } from "@/lib/types";

export const POST = (req: Request) =>
  handle(async () => {
    const body = await bodyOf(req);
    return svc.join(getStore(), { name: body.name, wishes: body.wishes, withToken: body.withToken });
  });
