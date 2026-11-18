"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { fill, outline, INK } from "@/lib/skin";

export type PengPose = "header" | "form" | "done" | "reveal" | "gift" | "look" | "beg" | "sleep" | "nap" | "held";

/** Which pose stands in when a look has no picture for the wanted one. */
const FALLBACK: Partial<Record<PengPose, PengPose>> = { sleep: "form", nap: "form", look: "header", gift: "header", beg: "header", held: "header", reveal: "done", done: "header" };

/** Peng image for the current look; falls back to the header pose, then to a drawn stand-in. */
export function Peng({ pose, className = "" }: { pose: PengPose; className?: string }) {
  const { theme } = useTheme();
  const base = `/peng/${theme}/peng-`;
  const poses = [pose, FALLBACK[pose], "header"].filter((p, i, a): p is PengPose => !!p && a.indexOf(p) === i);
  const candidates = poses.flatMap((p) => [`${base}${p}.webp`, `${base}${p}.png`]);
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => setStep(0), [theme, pose]);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setStep((s) => s + 1);
  }, [step, theme, pose]);
  if (step >= candidates.length) return <PengStandIn pose={pose} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} key={candidates[step]} src={candidates[step]} alt="Kater Peng als Weihnachtswichtel" className={`peng peng--${pose} ${className}`} onError={() => setStep((s) => s + 1)} draggable={false} />
  );
}

function PengStandIn({ pose, className }: { pose: PengPose; className: string }) {
  const { theme } = useTheme();
  const o = outline(theme);
  const happy = pose === "done" || pose === "reveal";
  const peek = pose === "form";
  return (
    <svg className={`peng peng--${pose} ${className}`} viewBox={peek ? "0 0 220 170" : "0 0 220 240"} role="img" aria-label="Kater Peng als Weihnachtswichtel (Platzhalter)">
      {!peek && (
        <>
          <ellipse cx="110" cy="188" rx="62" ry="46" fill={fill(theme, "green")} {...o} />
          <path d="M62 156 l14 18 12 -16 12 18 10 -18 10 18 12 -18 12 16 14 -18 q-48 -22 -96 0z" fill={fill(theme, "red")} {...o} />
          <circle cx="110" cy="178" r="9" fill={fill(theme, "gold")} {...outline(theme, 3)} />
          {happy ? (
            <>
              <ellipse cx="44" cy="128" rx="17" ry="20" fill={fill(theme, "cream")} {...o} />
              <ellipse cx="176" cy="128" rx="17" ry="20" fill={fill(theme, "cream")} {...o} />
            </>
          ) : (
            <>
              <ellipse cx="86" cy="226" rx="18" ry="11" fill={fill(theme, "cream")} {...o} />
              <ellipse cx="134" cy="226" rx="18" ry="11" fill={fill(theme, "cream")} {...o} />
            </>
          )}
        </>
      )}
      <path d="M54 62 L46 22 L86 46 Z M166 62 L174 22 L134 46 Z" fill={fill(theme, "grey")} {...o} />
      <ellipse cx="110" cy="104" rx="72" ry="58" fill={fill(theme, "grey")} {...o} />
      <ellipse cx="110" cy="126" rx="40" ry="27" fill={fill(theme, "cream")} />
      {happy ? (
        <path d="M70 102 q12 -14 24 0 M126 102 q12 -14 24 0" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      ) : (
        <g className="blink">
          <ellipse cx="82" cy="104" rx="12" ry="8" fill={INK} />
          <ellipse cx="138" cy="104" rx="12" ry="8" fill={INK} />
          <path d="M66 96 L98 100 M154 96 L122 100" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      <path d="M104 116 h12 l-6 7z" fill={fill(theme, "pink")} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      {happy ? <path d="M98 128 q12 16 24 0z" fill="#b5524c" stroke={INK} strokeWidth="3" strokeLinejoin="round" /> : <path d="M100 132 q5 -5 10 0 q5 -5 10 0" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />}
      <path d="M50 66 Q60 10 124 12 Q176 16 196 70 L170 64 Q150 40 122 46 Z" fill={fill(theme, "red")} {...o} />
      <rect x="40" y="52" width="110" height="24" rx="12" transform="rotate(-8 95 64)" fill={fill(theme, "cream")} {...o} />
      <circle className="jingle" cx="196" cy="78" r="12" fill={fill(theme, "gold")} {...o} />
      {peek && (
        <>
          <ellipse cx="70" cy="158" rx="20" ry="12" fill={fill(theme, "cream")} {...o} />
          <ellipse cx="150" cy="158" rx="20" ry="12" fill={fill(theme, "cream")} {...o} />
        </>
      )}
    </svg>
  );
}
