import { beforeEach, describe, expect, test } from "vitest";
import { MemoryStore, setStore } from "@/lib/store";
import { GET as getState } from "@/app/api/state/route";
import { POST as postJoin } from "@/app/api/join/route";
import { GET as getMe, PATCH as patchMe } from "@/app/api/me/route";
import { GET as getParticipants } from "@/app/api/host/participants/route";
import { DELETE as deleteParticipant } from "@/app/api/host/participants/[id]/route";
import { POST as postLink } from "@/app/api/host/participants/[id]/link/route";
import { PUT as putBudget } from "@/app/api/host/budget/route";
import { POST as postDraw } from "@/app/api/host/draw/route";
import { POST as postReset } from "@/app/api/host/reset/route";

const KEY = "test-key";
const req = (method: string, body?: unknown, headers: Record<string, string> = {}) =>
  new Request("http://x/api", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
const host = { "x-host-key": KEY };
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  process.env.HOST_KEY = KEY;
  setStore(new MemoryStore());
});

async function join(name: string) {
  const res = await postJoin(req("POST", { name, wishes: [`Geheimwunsch von ${name}`] }));
  expect(res.status).toBe(200);
  return (await res.json()) as { token: string; me: { id: string } };
}

describe("host routes", () => {
  const calls: [string, (h: Record<string, string>) => Promise<Response>][] = [
    ["participants", (h) => getParticipants(req("GET", undefined, h))],
    ["remove", (h) => deleteParticipant(req("DELETE", undefined, h), ctx("x"))],
    ["link", (h) => postLink(req("POST", undefined, h), ctx("x"))],
    ["budget", (h) => putBudget(req("PUT", { budget: "15 €" }, h))],
    ["draw", (h) => postDraw(req("POST", undefined, h))],
    ["reset", (h) => postReset(req("POST", { confirm: "PENG" }, h))],
  ];
  for (const [name, call] of calls) {
    test(`${name} answers 404 without or with a wrong key`, async () => {
      expect((await call({})).status).toBe(404);
      expect((await call({ "x-host-key": "wrong" })).status).toBe(404);
    });
  }

  test("answer 404 when no HOST_KEY is configured, even for an empty key", async () => {
    delete process.env.HOST_KEY;
    expect((await getParticipants(req("GET", undefined, { "x-host-key": "" }))).status).toBe(404);
  });

  test("reset needs the exact word PENG", async () => {
    await join("Mia");
    expect((await postReset(req("POST", { confirm: "peng" }, host))).status).toBe(400);
    const res = await postReset(req("POST", { confirm: "PENG" }, host));
    expect((await res.json()).participants).toEqual([]);
  });
});

describe("participant routes", () => {
  test("me without a token is 401", async () => {
    expect((await getMe(req("GET"))).status).toBe(401);
  });

  test("malformed JSON is 400", async () => {
    expect((await postJoin(req("POST", "{nope"))).status).toBe(400);
  });

  test("a taken name is 409 with its code", async () => {
    await join("Mia");
    const res = await postJoin(req("POST", { name: "MIA", wishes: ["x"] }));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "name_taken" });
  });

  test("public state has exactly phase, budget and eventDate", async () => {
    await join("Mia");
    const body = await (await getState()).json();
    expect(Object.keys(body).sort()).toEqual(["budget", "eventDate", "phase"]);
  });

  test("wishes can be edited via PATCH", async () => {
    const { token } = await join("Mia");
    const res = await patchMe(req("PATCH", { wishes: ["Neu"] }, { "x-peng-token": token }));
    expect((await res.json()).wishes).toEqual(["Neu"]);
  });
});

test("full flow: join, host sees counts only, draw, everyone gets a match", async () => {
  const people = [await join("Mia"), await join("Jonas"), await join("Oma Inge")];
  await putBudget(req("PUT", { budget: "15 €" }, host));

  const listText = await (await getParticipants(req("GET", undefined, host))).text();
  expect(listText).not.toContain("Geheimwunsch");
  expect(JSON.parse(listText).participants.map((p: { wishCount: number }) => p.wishCount)).toEqual([1, 1, 1]);

  const drawText = await (await postDraw(req("POST", undefined, host))).text();
  expect(drawText).not.toContain("Geheimwunsch");
  expect(drawText).not.toContain("givesTo");

  const names = [];
  for (const p of people) {
    const me = await (await getMe(req("GET", undefined, { "x-peng-token": p.token }))).json();
    expect(me.budget).toBe("15 €");
    expect(me.match.wishes[0]).toBe(`Geheimwunsch von ${me.match.name}`);
    names.push(me.match.name);
  }
  expect(new Set(names).size).toBe(3);

  const link = await (await postLink(req("POST", undefined, host), ctx(people[0].me.id))).json();
  expect((await getMe(req("GET", undefined, { "x-peng-token": people[0].token }))).status).toBe(401);
  expect((await getMe(req("GET", undefined, { "x-peng-token": link.token }))).status).toBe(200);
});

test("the pairing overview needs the host key", async () => {
  const { GET: getPairs } = await import("@/app/api/host/pairs/route");
  expect((await getPairs(req("GET"))).status).toBe(404);
  expect((await getPairs(req("GET", undefined, host))).status).toBe(200);
});
