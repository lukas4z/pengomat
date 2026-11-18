import { ServiceError, type State } from "./types";

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

const READ = `return redis.call('GET', KEYS[1])`;

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
    // Read through a script: scripts run on the primary database, so a read right after a write
    // never returns an older copy from a read replica.
    const raw = await (await this.client()).eval(READ, [STATE_KEY], []);
    return typeof raw === "string" && raw ? (JSON.parse(raw) as State) : emptyState();
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

/** Finds the Upstash REST settings, also when the Vercel integration added a prefix to the names. */
export function redisConfig(env: Record<string, string | undefined>): { url: string; token: string } | null {
  for (const base of ["UPSTASH_REDIS_REST", "KV_REST_API"]) {
    for (const key of Object.keys(env)) {
      if (!key.endsWith(`${base}_URL`)) continue;
      const prefix = key.slice(0, key.length - `${base}_URL`.length);
      const url = env[key];
      const token = env[`${prefix}${base}_TOKEN`];
      if (url && token) return { url, token };
    }
  }
  return null;
}

export type StorageKind = "redis" | "memory";
let kind: StorageKind = "memory";
export const storageKind = () => kind;

/**
 * Redis when configured, otherwise in-memory for local use.
 * On Vercel there is no usable memory (every server instance has its own and forgets it),
 * so a missing database is an error there instead of silently losing entries.
 */
export function getStore(): Store {
  if (!current) {
    const cfg = redisConfig(process.env);
    if (cfg) {
      current = new RedisStore(cfg.url, cfg.token);
      kind = "redis";
    } else {
      if (process.env.VERCEL) throw new ServiceError("no_database");
      // survive dev-server module reloads
      const g = globalThis as { __pengomatStore?: Store };
      current = g.__pengomatStore ??= new MemoryStore();
      kind = "memory";
    }
  }
  return current;
}
