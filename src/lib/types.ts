export type Phase = "signup" | "drawn";
export interface Participant {
  id: string;
  name: string;
  wishes: string[];
  joinedAt: string;
  tokenHash: string;
  givesTo?: string;
}
export interface State {
  version: number;
  phase: Phase;
  budget: string;
  drawnAt?: string;
  participants: Participant[];
}
export interface PublicState { phase: Phase; budget: string; eventDate: string }
export interface Me {
  id: string;
  name: string;
  wishes: string[];
  phase: Phase;
  budget: string;
  match?: { name: string; wishes: string[] };
}
export interface HostParticipant { id: string; name: string; joinedAt: string; wishCount: number }
export interface HostView { phase: Phase; budget: string; drawnAt?: string; participants: HostParticipant[] }
export type ErrorCode = "invalid" | "name_taken" | "closed" | "full" | "unauthorized" | "not_found" | "too_few" | "already_drawn";
export class ServiceError extends Error {
  constructor(public code: ErrorCode) {
    super(code);
  }
}
export const EVENT_DATE = "2026-12-26T00:00:00+01:00";
export const LIMITS = { nameMin: 2, nameMax: 30, wishMax: 200, wishesMax: 3, budgetMax: 40, participantsMax: 50, drawMin: 3 };
