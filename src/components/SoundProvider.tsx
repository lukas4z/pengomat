"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getFlag, setFlag } from "@/lib/client";

export type SoundName = "rattle" | "pop" | "bell" | "click";
export interface SoundApi { play(name: SoundName): void; muted: boolean; toggle(): void }

export const SoundContext = createContext<SoundApi>({ play: () => {}, muted: true, toggle: () => {} });
export const useSound = () => useContext(SoundContext);

const MUTE_FLAG = "pengomat-muted";

// "Stille Nacht" (public domain) as a quiet music box. [note, length in eighths]; 6 eighths per bar.
const N: Record<string, number> = { C3: 130.81, F3: 174.61, G3: 196.0, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46 };
const MELODY: [string | null, number][] = [
  ["G4", 3], ["A4", 1], ["G4", 2], ["E4", 6], ["G4", 3], ["A4", 1], ["G4", 2], ["E4", 6],
  ["D5", 4], ["D5", 2], ["B4", 6], ["C5", 4], ["C5", 2], ["G4", 6],
  ["A4", 4], ["A4", 2], ["C5", 3], ["B4", 1], ["A4", 2], ["G4", 3], ["A4", 1], ["G4", 2], ["E4", 6],
  ["A4", 4], ["A4", 2], ["C5", 3], ["B4", 1], ["A4", 2], ["G4", 3], ["A4", 1], ["G4", 2], ["E4", 6],
  ["D5", 4], ["D5", 2], ["F5", 3], ["D5", 1], ["B4", 2], ["C5", 6], ["E5", 6],
  ["C5", 2], ["G4", 2], ["E4", 2], ["G4", 3], ["F4", 1], ["D4", 2], ["C4", 6], [null, 6],
];
const BASS = ["C3", "C3", "C3", "C3", "G3", "G3", "C3", "C3", "F3", "F3", "C3", "C3", "F3", "F3", "C3", "C3", "G3", "G3", "C3", "C3", "C3", "G3", "C3", "C3"];
const EIGHTH = 0.4;

// Recorded Christmas music (see CREDITS.md). The music box above only plays if these cannot load.
const TRACKS = ["jingle-bells", "deck-the-halls", "up-on-a-housetop", "angels-we-have-heard", "sugar-plum-fairy"].map((n) => `/audio/${n}.mp3`);
const MUSIC_VOLUME = 0.32;

type Engine = { ctx: AudioContext; master: GainNode; music: GainNode; noise: AudioBuffer };

function createEngine(): Engine | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const master = ctx.createGain();
  master.connect(ctx.destination);
  const music = ctx.createGain();
  music.gain.value = 0.16;
  // a little echo so the music box sounds like it stands in a room
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.28;
  const fb = ctx.createGain();
  fb.gain.value = 0.28;
  music.connect(master);
  music.connect(delay);
  delay.connect(fb);
  fb.connect(delay);
  fb.connect(master);
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return { ctx, master, music, noise };
}

function tone(e: Engine, out: AudioNode, freq: number, at: number, dur: number, vol: number, type: OscillatorType = "sine") {
  const o = e.ctx.createOscillator();
  const g = e.ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(vol, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.05);
}

function burst(e: Engine, at: number, dur: number, freq: number, vol: number) {
  const src = e.ctx.createBufferSource();
  src.buffer = e.noise;
  const f = e.ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 1.6;
  const g = e.ctx.createGain();
  g.gain.setValueAtTime(vol, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(f).connect(g).connect(e.master);
  src.start(at, Math.random() * 0.5, dur + 0.02);
}

const EFFECTS: Record<SoundName, (e: Engine, t: number) => void> = {
  // things knocking about inside a cardboard box
  rattle(e, t) {
    for (let i = 0; i < 9; i++) {
      const at = t + i * 0.045 + Math.random() * 0.03;
      burst(e, at, 0.04 + Math.random() * 0.03, 900 + Math.random() * 2600, 0.5);
      if (i % 3 === 0) tone(e, e.master, 95 + Math.random() * 40, at, 0.09, 0.35, "triangle");
    }
  },
  pop(e, t) {
    const o = e.ctx.createOscillator();
    const g = e.ctx.createGain();
    o.frequency.setValueAtTime(260, t);
    o.frequency.exponentialRampToValueAtTime(980, t + 0.12);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g).connect(e.master);
    o.start(t);
    o.stop(t + 0.25);
    burst(e, t, 0.06, 2400, 0.3);
    [1318.5, 1568, 2093].forEach((f, i) => tone(e, e.master, f, t + 0.12 + i * 0.09, 0.9, 0.16));
  },
  bell(e, t) {
    tone(e, e.master, 1318.5, t, 1.1, 0.22);
    tone(e, e.master, 2637, t, 0.6, 0.07);
    tone(e, e.master, 1760, t + 0.14, 1.2, 0.18);
  },
  click(e, t) {
    tone(e, e.master, 1100, t, 0.05, 0.12, "triangle");
  },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const engine = useRef<Engine | null>(null);
  const timer = useRef<number | null>(null);
  const cursor = useRef({ i: 0, at: 0, eighths: 0 });
  const player = useRef<HTMLAudioElement | null>(null);
  const track = useRef(Math.floor(Math.random() * TRACKS.length));
  const useBox = useRef(false);

  const playMusic = useCallback(() => {
    if (mutedRef.current || useBox.current) return;
    if (!player.current) {
      const a = new Audio(TRACKS[track.current]);
      a.volume = MUSIC_VOLUME;
      a.preload = "auto";
      a.addEventListener("ended", () => {
        track.current = (track.current + 1) % TRACKS.length;
        a.src = TRACKS[track.current];
        a.play().catch(() => {});
      });
      a.addEventListener("error", () => {
        useBox.current = true; // files missing: fall back to the music box
      });
      player.current = a;
    }
    player.current.play().catch(() => {});
  }, []);

  const schedule = useCallback(() => {
    const e = engine.current;
    if (!e || mutedRef.current || !useBox.current) return;
    const c = cursor.current;
    if (c.at < e.ctx.currentTime) c.at = e.ctx.currentTime + 0.1;
    while (c.at < e.ctx.currentTime + 1.2) {
      const [note, len] = MELODY[c.i];
      if (c.eighths % 6 === 0) tone(e, e.music, N[BASS[(c.eighths / 6) % BASS.length]], c.at, 2.2, 0.35);
      if (note) {
        tone(e, e.music, N[note] * 2, c.at, 1.6, 0.5);
        tone(e, e.music, N[note] * 4, c.at, 0.5, 0.08);
      }
      c.at += len * EIGHTH;
      c.eighths += len;
      c.i = (c.i + 1) % MELODY.length;
      if (c.i === 0) c.eighths = 0;
    }
  }, []);

  const start = useCallback(() => {
    if (!engine.current) engine.current = createEngine();
    const e = engine.current;
    if (!e) return;
    if (e.ctx.state === "suspended" && !mutedRef.current) e.ctx.resume().catch(() => {});
    if (timer.current === null) timer.current = window.setInterval(schedule, 300);
    playMusic();
  }, [schedule, playMusic]);

  useEffect(() => {
    const m = getFlag(MUTE_FLAG);
    mutedRef.current = m;
    setMuted(m);
    // browsers only allow sound after the first touch or key press
    // (on iPhones only finger-up and click count), so keep trying until the audio actually runs
    const events = ["pointerdown", "pointerup", "click", "keydown"] as const;
    const first = () => {
      start();
      const musicOn = mutedRef.current || useBox.current || (player.current && !player.current.paused);
      if (engine.current?.ctx.state === "running" && musicOn) events.forEach((ev) => window.removeEventListener(ev, first));
    };
    events.forEach((ev) => window.addEventListener(ev, first));
    const onVisible = () => {
      const e = engine.current;
      const hidden = document.visibilityState === "hidden";
      if (hidden) player.current?.pause();
      else playMusic();
      if (!e) return;
      if (hidden) e.ctx.suspend().catch(() => {});
      else if (!mutedRef.current) e.ctx.resume().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      player.current?.pause();
      events.forEach((ev) => window.removeEventListener(ev, first));
      document.removeEventListener("visibilitychange", onVisible);
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, [start, playMusic]);

  const api = useMemo<SoundApi>(
    () => ({
      muted,
      play(name) {
        if (mutedRef.current) return;
        start();
        const e = engine.current;
        if (e) EFFECTS[name](e, e.ctx.currentTime + 0.01);
      },
      toggle() {
        const next = !mutedRef.current;
        mutedRef.current = next;
        setMuted(next);
        setFlag(MUTE_FLAG, next);
        if (next) player.current?.pause();
        start();
        const e = engine.current;
        if (!e) return;
        if (next) e.ctx.suspend().catch(() => {});
        else e.ctx.resume().catch(() => {});
      },
    }),
    [muted, start],
  );

  return (
    <SoundContext.Provider value={api}>
      {children}
      <button type="button" className={`sound-toggle${muted ? " sound-toggle--off" : ""}`} aria-pressed={!muted} aria-label={muted ? "Ton einschalten" : "Ton ausschalten"} onClick={api.toggle}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
          {muted ? <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" /> : <path d="M16 8.5c1.6 1.8 1.6 5.2 0 7M18.6 6c3 3.2 3 8.800 0 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />}
        </svg>
        <span>{muted ? "Ton aus" : "Ton an"}</span>
      </button>
    </SoundContext.Provider>
  );
}
