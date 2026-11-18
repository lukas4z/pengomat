"use client";
import { createContext, useContext } from "react";

export type SoundName = "rattle" | "pop" | "bell" | "click";
export interface SoundApi { play(name: SoundName): void; muted: boolean; toggle(): void }

export const SoundContext = createContext<SoundApi>({ play: () => {}, muted: true, toggle: () => {} });
export const useSound = () => useContext(SoundContext);
