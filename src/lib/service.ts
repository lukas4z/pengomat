import { createHash, randomBytes, randomUUID } from "node:crypto";
import { drawChain } from "./draw";
import type { Store } from "./store";
import { EVENT_DATE, LIMITS, ServiceError, type HostView, type Me, type Participant, type PublicState, type State } from "./types";
import { parseBudget, parseName, parseWishes } from "./validate";

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");
const fold = (name: string) => name.toLocaleLowerCase("de-DE");

async function mutate<T>(store: Store, fn: (state: State) => T): Promise<T> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const state = await store.read();
    const expected = state.version;
    const result = fn(state);
    state.version = expected + 1;
    if (await store.write(state, expected)) return result;
    // someone else wrote in between: wait a moment (a little longer each time) and try again
    await new Promise((r) => setTimeout(r, 15 + attempt * 25 + Math.random() * 30));
  }
  throw new Error("Speichern fehlgeschlagen – bitte nochmal versuchen");
}

function findByToken(state: State, token: string): Participant {
  const h = typeof token === "string" && token ? hash(token) : "";
  const p = h ? state.participants.find((x) => x.tokenHash === h) : undefined;
  if (!p) throw new ServiceError("unauthorized");
  return p;
}

function findById(state: State, id: string): Participant {
  const p = state.participants.find((x) => x.id === id);
  if (!p) throw new ServiceError("not_found");
  return p;
}

function toMe(state: State, p: Participant): Me {
  const me: Me = { id: p.id, name: p.name, wishes: p.wishes, phase: state.phase, budget: state.budget };
  if (state.phase === "drawn" && p.givesTo) {
    const other = state.participants.find((x) => x.id === p.givesTo);
    if (other) me.match = { name: other.name, wishes: other.wishes };
  }
  return me;
}

function toHostView(state: State): HostView {
  return {
    phase: state.phase,
    budget: state.budget,
    ...(state.drawnAt ? { drawnAt: state.drawnAt } : {}),
    participants: state.participants.map((p) => ({ id: p.id, name: p.name, joinedAt: p.joinedAt, wishCount: p.wishes.length })),
  };
}

const requireSignup = (state: State) => {
  if (state.phase !== "signup") throw new ServiceError("closed");
};

export async function publicState(store: Store): Promise<PublicState> {
  const state = await store.read();
  return { phase: state.phase, budget: state.budget, eventDate: EVENT_DATE };
}

export async function join(store: Store, input: { name: unknown; wishes: unknown }): Promise<{ token: string; me: Me }> {
  const name = parseName(input.name);
  const wishes = parseWishes(input.wishes);
  const token = newToken();
  return mutate(store, (state) => {
    requireSignup(state);
    if (state.participants.some((p) => fold(p.name) === fold(name))) throw new ServiceError("name_taken");
    if (state.participants.length >= LIMITS.participantsMax) throw new ServiceError("full");
    const p: Participant = { id: randomUUID(), name, wishes, joinedAt: new Date().toISOString(), tokenHash: hash(token) };
    state.participants.push(p);
    return { token, me: toMe(state, p) };
  });
}

export async function getMe(store: Store, token: string): Promise<Me> {
  const state = await store.read();
  return toMe(state, findByToken(state, token));
}

export async function updateWishes(store: Store, token: string, wishes: unknown): Promise<Me> {
  const parsed = parseWishes(wishes);
  return mutate(store, (state) => {
    const p = findByToken(state, token);
    requireSignup(state);
    p.wishes = parsed;
    return toMe(state, p);
  });
}

export async function hostView(store: Store): Promise<HostView> {
  return toHostView(await store.read());
}

export async function setBudget(store: Store, budget: unknown): Promise<HostView> {
  const parsed = parseBudget(budget);
  return mutate(store, (state) => {
    requireSignup(state);
    state.budget = parsed;
    return toHostView(state);
  });
}

export async function removeParticipant(store: Store, id: string): Promise<HostView> {
  return mutate(store, (state) => {
    requireSignup(state);
    findById(state, id);
    state.participants = state.participants.filter((p) => p.id !== id);
    return toHostView(state);
  });
}

export async function reissueToken(store: Store, id: string): Promise<{ token: string }> {
  const token = newToken();
  return mutate(store, (state) => {
    findById(state, id).tokenHash = hash(token);
    return { token };
  });
}

export async function draw(store: Store): Promise<HostView> {
  return mutate(store, (state) => {
    if (state.phase === "drawn") throw new ServiceError("already_drawn");
    if (state.participants.length < LIMITS.drawMin) throw new ServiceError("too_few");
    const chain = drawChain(state.participants.map((p) => p.id));
    for (const p of state.participants) p.givesTo = chain[p.id];
    state.phase = "drawn";
    state.drawnAt = new Date().toISOString();
    return toHostView(state);
  });
}

export async function reset(store: Store): Promise<HostView> {
  return mutate(store, (state) => {
    state.participants = [];
    state.phase = "signup";
    delete state.drawnAt;
    return toHostView(state);
  });
}
