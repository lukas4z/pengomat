"use client";
import { useRef, useState, type ReactNode } from "react";
import { Peng, type PengPose } from "./Peng";

export function BudgetTag({ budget }: { budget: string }) {
  return (
    <div className="tag-row">
      <div className="tag">
        <small>Budget</small>
        {budget || "wird noch festgelegt"}
      </div>
    </div>
  );
}

const ANGLES = [-80, -55, -30, -8, 14, 36, 60, 84, -100, 104];

/** A short burst of little stars, used when something nice happens. */
export function Sparkles({ count = ANGLES.length }: { count?: number }) {
  return (
    <span className="sparkles" aria-hidden>
      {ANGLES.slice(0, count).map((a, i) => (
        <i key={i} style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${90 + (i % 3) * 34}px`, animationDelay: `${i * 35}ms` }} />
      ))}
    </span>
  );
}

/** Snow lying on the top edge of a card. */
function SnowCap() {
  return (
    <svg className="snowcap" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="snow-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d5e3f6" />
        </linearGradient>
      </defs>
      <path
        vectorEffect="non-scaling-stroke"
        d="M2 40 Q0 18 22 16 Q40 2 70 10 Q100 0 130 8 Q170 -2 210 8 Q250 0 285 10 Q320 2 350 12 Q386 10 398 34 Q402 52 388 50 Q376 40 362 50 Q346 60 330 46 L70 46 Q56 60 40 48 Q26 40 14 52 Q2 56 2 40 Z"
      />
    </svg>
  );
}

type Drop = { id: number; x: number; size: number; dx: number; delay: number; dist: number };
let dropId = 0;

/**
 * The cream panel everything sits on: snow on top, Peng lying on the snow.
 * Tapping the card shakes a little snow loose.
 */
export function Card({
  pose,
  mood = "awake",
  budget,
  className = "",
  sparkle = false,
  children,
}: {
  pose: PengPose;
  /** sleep: breathing with z's · wake: just woke up (plays once) · awake: gentle idle */
  mood?: "sleep" | "wake" | "awake";
  budget?: string;
  className?: string;
  sparkle?: boolean;
  children: ReactNode;
}) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [nudge, setNudge] = useState(0);
  const last = useRef(0);

  function shakeSnow(e: React.PointerEvent<HTMLElement>) {
    const now = Date.now();
    if (now - last.current < 450) return;
    last.current = now;
    const rect = e.currentTarget.getBoundingClientRect();
    const centre = ((e.clientX - rect.left) / rect.width) * 100;
    const fresh: Drop[] = Array.from({ length: 7 }, (_, i) => ({
      id: ++dropId,
      x: Math.max(3, Math.min(97, centre + (Math.random() - 0.5) * 70)),
      size: 7 + Math.random() * 9,
      dx: (Math.random() - 0.5) * 46,
      delay: i * 45 + Math.random() * 60,
      dist: 110 + Math.random() * 120,
    }));
    setDrops((d) => [...d, ...fresh]);
    setNudge((n) => n + 1);
    const ids = new Set(fresh.map((f) => f.id));
    window.setTimeout(() => setDrops((d) => d.filter((x) => !ids.has(x.id))), 1700);
  }

  return (
    <section className={`card ${className}`} onPointerDown={shakeSnow}>
      <div className={`card__peng card__peng--${mood}`}>
        <Peng pose={pose} />
        {mood === "sleep" && (
          <span className="zzz" aria-hidden>
            <i>z</i>
            <i>z</i>
            <i>z</i>
          </span>
        )}
      </div>
      <div key={nudge} className={`card__snow${nudge ? " card__snow--nudge" : ""}`}>
        <SnowCap />
      </div>
      <span className="snowdrops" aria-hidden>
        {drops.map((d) => (
          <i key={d.id} style={{ left: `${d.x}%`, width: d.size, height: d.size, animationDelay: `${d.delay}ms`, ["--dx" as string]: `${d.dx}px`, ["--dist" as string]: `${d.dist}px` }} />
        ))}
      </span>
      {sparkle && <Sparkles count={6} />}
      {budget !== undefined && <BudgetTag budget={budget} />}
      {children}
    </section>
  );
}
