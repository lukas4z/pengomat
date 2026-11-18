import type { State } from "./types";

export interface Store {
  read(): Promise<State>;
  /** Writes only if the stored version still equals expectedVersion. */
  write(next: State, expectedVersion: number): Promise<boolean>;
}

export const emptyState = (): State => ({ version: 0, phase: "signup", budget: "", participants: [] });

export class MemoryStore implements Store {
  private state: State = emptyState();
  async read(): Promise<State> {
    return structuredClone(this.state);
  }
  async write(next: State, expectedVersion: number): Promise<boolean> {
    if (this.state.version !== expectedVersion) return false;
    this.state = structuredClone(next);
    return true;
  }
}

const STATE_KEY = "pengomat:state";
const VERSION_KEY = "pengomat:version";
const CAS = `
local v = redis.call('GET', KEYS[2])
if not v then v = '0' end
if v ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('SET', KEYS[2], ARGV[3])
return 1`;

/** Whole state as one JSON string in Upstash Redis; writes are compare-and-set on a version key. */
export class RedisStore implements Store {
  private redis: import("@upstash/redis").Redis | undefined;
  constructor(private url: string, private token: string) {}
  private async client() {
    if (!this.redis) {
      const { Redis } = await import("@upstash/redis");
      this.redis = new Redis({ url: this.url, token: this.token, automaticDeserialization: false });
    }
    return this.redis;
  }
  async read(): Promise<State> {
    const raw = await (await this.client()).get<string>(STATE_KEY);
    return raw ? (JSON.parse(raw) as State) : emptyState();
  }
  async write(next: State, expectedVersion: number): Promise<boolean> {
    const ok = await (await this.client()).eval(CAS, [STATE_KEY, VERSION_KEY], [String(expectedVersion), JSON.stringify(next), String(next.version)]);
    return Number(ok) === 1;
  }
}

let current: Store | undefined;

export function setStore(store: Store) {
  current = store;
}

/** Redis when configured (Vercel Marketplace / Upstash env names), otherwise in-memory for local use. */
export function getStore(): Store {
  if (!current) {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (url && token) current = new RedisStore(url, token);
    else {
      // survive dev-server module reloads
      const g = globalThis as { __pengomatStore?: Store };
      current = g.__pengomatStore ??= new MemoryStore();
    }
  }
  return current;
}
