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
