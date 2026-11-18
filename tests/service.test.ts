import { beforeEach, describe, expect, test } from "vitest";
import { MemoryStore } from "@/lib/store";
import * as svc from "@/lib/service";

let s: MemoryStore;
beforeEach(() => {
  s = new MemoryStore();
});

const code = async (p: Promise<unknown>) => p.then(() => "ok", (e) => e.code ?? String(e));

async function joinN(n: number) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(await svc.join(s, { name: `Person ${i}`, wishes: [`Geheimwunsch-${i}`] }));
  return out;
}

describe("joining", () => {
  test("returns a token that identifies the person, without a match", async () => {
    const { token, me } = await svc.join(s, { name: " Mia ", wishes: ["Socken", ""] });
    expect(me).toMatchObject({ name: "Mia", wishes: ["Socken"], phase: "signup" });
    const again = await svc.getMe(s, token);
    expect(again.name).toBe("Mia");
    expect(again.match).toBeUndefined();
  });

  test("stores only a hash of the token", async () => {
    const { token } = await svc.join(s, { name: "Mia", wishes: ["Socken"] });
    expect(JSON.stringify(await s.read())).not.toContain(token);
  });

  test("rejects a name that is taken, ignoring case", async () => {
    await svc.join(s, { name: "Mia", wishes: ["a"] });
    expect(await code(svc.join(s, { name: "mia", wishes: ["b"] }))).toBe("name_taken");
  });

  test("lets exactly one of two simultaneous identical joins through", async () => {
    const r = await Promise.all([code(svc.join(s, { name: "Mia", wishes: ["a"] })), code(svc.join(s, { name: "Mia", wishes: ["b"] }))]);
    expect(r.sort()).toEqual(["name_taken", "ok"]);
    expect((await svc.hostView(s)).participants).toHaveLength(1);
  });

  test("keeps both of two simultaneous different joins", async () => {
    await Promise.all([svc.join(s, { name: "Mia", wishes: ["a"] }), svc.join(s, { name: "Jonas", wishes: ["b"] })]);
    expect((await svc.hostView(s)).participants).toHaveLength(2);
  });

  test("refuses the 51st participant", async () => {
    await joinN(50);
    expect(await code(svc.join(s, { name: "Zu spät", wishes: ["a"] }))).toBe("full");
  });

  test("an unknown token is unauthorized", async () => {
    expect(await code(svc.getMe(s, "nope"))).toBe("unauthorized");
    expect(await code(svc.getMe(s, ""))).toBe("unauthorized");
  });

  test("wishes can be changed before the draw", async () => {
    const { token } = await svc.join(s, { name: "Mia", wishes: ["a"] });
    const me = await svc.updateWishes(s, token, ["b", "c"]);
    expect(me.wishes).toEqual(["b", "c"]);
  });
});

describe("host view", () => {
  test("shows names, times and wish counts but never wishes, tokens or pairings", async () => {
    const people = await joinN(4);
    const check = async () => {
      const view = await svc.hostView(s);
      const json = JSON.stringify(view);
      expect(json).not.toContain("Geheimwunsch");
      expect(json).not.toContain("tokenHash");
      expect(json).not.toContain("givesTo");
      for (const p of people) expect(json).not.toContain(p.token);
      expect(view.participants[0]).toEqual({ id: expect.any(String), name: "Person 0", joinedAt: expect.any(String), wishCount: 1 });
    };
    await check();
    await svc.draw(s);
    await check();
  });

  test("budget can be set and shows up for everyone", async () => {
    await svc.setBudget(s, " 15 € ");
    expect((await svc.publicState(s)).budget).toBe("15 €");
  });

  test("public state has no names", async () => {
    await joinN(3);
    expect(Object.keys(await svc.publicState(s)).sort()).toEqual(["budget", "eventDate", "phase"]);
  });

  test("a removed participant loses access", async () => {
    const [a] = await joinN(3);
    const view = await svc.removeParticipant(s, a.me.id);
    expect(view.participants).toHaveLength(2);
    expect(await code(svc.getMe(s, a.token))).toBe("unauthorized");
    expect(await code(svc.removeParticipant(s, "missing"))).toBe("not_found");
  });

  test("a reissued link replaces the old one", async () => {
    const [a] = await joinN(3);
    const { token } = await svc.reissueToken(s, a.me.id);
    expect(await code(svc.getMe(s, a.token))).toBe("unauthorized");
    expect((await svc.getMe(s, token)).name).toBe("Person 0");
    expect(await code(svc.reissueToken(s, "missing"))).toBe("not_found");
  });
});

describe("draw", () => {
  test("needs at least three people", async () => {
    await joinN(2);
    expect(await code(svc.draw(s))).toBe("too_few");
  });

  test("gives everyone a different other person and their wishes", async () => {
    const people = await joinN(5);
    const view = await svc.draw(s);
    expect(view.phase).toBe("drawn");
    expect(view.drawnAt).toEqual(expect.any(String));
    const matches = [];
    for (const p of people) {
      const me = await svc.getMe(s, p.token);
      expect(me.phase).toBe("drawn");
      expect(me.match!.name).not.toBe(me.name);
      const idx = Number(me.match!.name.split(" ")[1]);
      expect(me.match!.wishes).toEqual([`Geheimwunsch-${idx}`]);
      matches.push(me.match!.name);
    }
    expect(new Set(matches).size).toBe(5);
  });

  test("cannot run twice, even at the same moment", async () => {
    const people = await joinN(4);
    const r = await Promise.all([code(svc.draw(s)), code(svc.draw(s))]);
    expect(r.sort()).toEqual(["already_drawn", "ok"]);
    const before = await Promise.all(people.map((p) => svc.getMe(s, p.token)));
    expect(await code(svc.draw(s))).toBe("already_drawn");
    const after = await Promise.all(people.map((p) => svc.getMe(s, p.token)));
    expect(after.map((m) => m.match!.name)).toEqual(before.map((m) => m.match!.name));
  });

  test("closes joining, editing, removing and the budget", async () => {
    const people = await joinN(3);
    await svc.draw(s);
    expect(await code(svc.join(s, { name: "Neu", wishes: ["a"] }))).toBe("closed");
    expect(await code(svc.updateWishes(s, people[0].token, ["x"]))).toBe("closed");
    expect(await code(svc.removeParticipant(s, people[0].me.id))).toBe("closed");
    expect(await code(svc.setBudget(s, "20 €"))).toBe("closed");
  });

  test("a reissued link after the draw keeps the same match", async () => {
    const people = await joinN(3);
    await svc.draw(s);
    const before = await svc.getMe(s, people[1].token);
    const { token } = await svc.reissueToken(s, people[1].me.id);
    expect((await svc.getMe(s, token)).match).toEqual(before.match);
  });

  test("reset clears people and the draw but keeps the budget", async () => {
    const people = await joinN(3);
    await svc.setBudget(s, "15 €");
    await svc.draw(s);
    const view = await svc.reset(s);
    expect(view).toMatchObject({ phase: "signup", budget: "15 €", participants: [] });
    expect(view.drawnAt).toBeUndefined();
    expect(await code(svc.getMe(s, people[0].token))).toBe("unauthorized");
  });
});
