import type { ErrorCode, HostView, Me, PublicState } from "./types";

const TOKEN_KEY = "pengomat-token";
let memoryToken: string | null = null;

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}
export function setToken(token: string) {
  memoryToken = token;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}
export function clearToken() {
  memoryToken = null;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** Small per-device flags (reveal seen, sound muted); never required for the flow. */
export function getFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}
export function setFlag(key: string, on: boolean) {
  try {
    if (on) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {}
}

export class ApiError extends Error {
  constructor(public code: ErrorCode | "network" | "server") {
    super(code);
  }
}

async function call<T>(path: string, opts: { method?: string; body?: unknown; token?: string | null; hostKey?: string } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: opts.method ?? "GET",
      cache: "no-store",
      headers: {
        ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
        ...(opts.token ? { "x-peng-token": opts.token } : {}),
        ...(opts.hostKey ? { "x-host-key": opts.hostKey } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("network");
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new ApiError(((data as { error?: ErrorCode } | null)?.error ?? "server") as ErrorCode);
  return data as T;
}

export const api = {
  state: () => call<PublicState>("/api/state"),
  join: (name: string, wishes: string[]) => call<{ token: string; me: Me }>("/api/join", { method: "POST", body: { name, wishes } }),
  me: (token: string) => call<Me>("/api/me", { token }),
  updateWishes: (token: string, wishes: string[]) => call<Me>("/api/me", { method: "PATCH", token, body: { wishes } }),
};

export const hostApi = (hostKey: string) => ({
  view: () => call<HostView>("/api/host/participants", { hostKey }),
  setBudget: (budget: string) => call<HostView>("/api/host/budget", { method: "PUT", hostKey, body: { budget } }),
  remove: (id: string) => call<HostView>(`/api/host/participants/${encodeURIComponent(id)}`, { method: "DELETE", hostKey }),
  reissue: (id: string) => call<{ token: string }>(`/api/host/participants/${encodeURIComponent(id)}/link`, { method: "POST", hostKey }),
  draw: () => call<HostView>("/api/host/draw", { method: "POST", hostKey }),
  reset: () => call<HostView>("/api/host/reset", { method: "POST", hostKey, body: { confirm: "PENG" } }),
});

export const personalLink = (token: string) => `${window.location.origin}/?t=${encodeURIComponent(token)}`;

export function errorText(code: string): string {
  switch (code) {
    case "name_taken": return "Den Namen gibt's schon – nimm einen Spitznamen.";
    case "full": return "Die Runde ist leider schon voll.";
    case "closed": return "Die Auslosung ist schon gelaufen – das geht jetzt nicht mehr.";
    case "invalid": return "Da stimmt etwas mit der Eingabe nicht. Schau bitte nochmal drüber.";
    case "too_few": return "Mindestens 3 Wichtel nötig.";
    case "already_drawn": return "Es wurde schon ausgelost.";
    case "not_found": return "Das gibt es nicht mehr.";
    case "no_database": return "Die Datenbank ist nicht verbunden – Einträge würden verloren gehen. Bitte der Gastgeberin Bescheid geben.";
    case "network": return "Keine Verbindung. Bitte versuch es gleich nochmal.";
    default: return "Da ist etwas schiefgegangen. Bitte versuch es nochmal.";
  }
}
