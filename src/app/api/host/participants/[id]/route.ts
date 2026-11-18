import { bodyOf, handle, requireHost, tokenOf } from "@/lib/http";
import * as svc from "@/lib/service";
import { getStore } from "@/lib/store";
import { ServiceError } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = (req: Request, { params }: Ctx) =>
  handle(async () => {
    requireHost(req);
    return svc.removeParticipant(getStore(), (await params).id);
  });
