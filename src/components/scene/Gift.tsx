"use client";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { fill, outline } from "@/lib/skin";

/** The present. `shake` 1–3 plays a growing wobble (re-triggered via `tick`), `open` pops it open. */
export function Gift({ shake = 0, open = false, tick = 0 }: { shake?: 0 | 1 | 2 | 3; open?: boolean; tick?: number }) {
  const { theme } = useTheme();
  const [noImage, setNoImage] = useState(false);
  const cls = `gift${shake ? ` gift--wobble${shake}` : ""}${open ? " gift--open" : ""}`;
  if (theme === "film" && !noImage) {
    return (
      <div key={tick} className={`${cls} gift--img`} role="img" aria-label="Geschenk">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/peng/film/peng-gift.webp" alt="" draggable={false} onError={() => setNoImage(true)} />
      </div>
    );
  }
  const o = outline(theme, 5);
  return (
    <svg key={tick} className={cls} viewBox="0 0 200 210" role="img" aria-label="Geschenk">
      <ellipse cx="100" cy="196" rx="78" ry="9" fill="#000" opacity="0.18" />
      <rect x="30" y="86" width="140" height="106" rx="12" fill={fill(theme, "red")} {...o} />
      <rect x="88" y="86" width="24" height="106" fill={fill(theme, "gold")} {...outline(theme, 4)} />
      <g fill="#fff" opacity="0.55">
        <circle cx="54" cy="120" r="4" /><circle cx="70" cy="160" r="4" /><circle cx="140" cy="130" r="4" /><circle cx="152" cy="168" r="4" />
      </g>
      <g className="gift__lid">
        <rect x="20" y="62" width="160" height="36" rx="11" fill={fill(theme, "red")} {...o} />
        <rect x="86" y="62" width="28" height="36" fill={fill(theme, "gold")} {...outline(theme, 4)} />
        <ellipse cx="74" cy="46" rx="26" ry="15" transform="rotate(-18 74 46)" fill={fill(theme, "gold")} {...o} />
        <ellipse cx="126" cy="46" rx="26" ry="15" transform="rotate(18 126 46)" fill={fill(theme, "gold")} {...o} />
        <circle cx="100" cy="54" r="12" fill={fill(theme, "gold")} {...o} />
      </g>
    </svg>
  );
}
