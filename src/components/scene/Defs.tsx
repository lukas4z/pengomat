import { PALETTE } from "@/lib/skin";

/** Shared gradients for the film look. Rendered once per page. */
export function Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        {Object.entries(PALETTE).map(([name, [light, base, dark]]) => (
          <radialGradient key={name} id={`g-${name}`} cx="0.34" cy="0.26" r="0.95">
            <stop offset="0" stopColor={light} />
            <stop offset="0.5" stopColor={base} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>
        ))}
        <radialGradient id="g-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="g-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff7a2e" />
          <stop offset="1" stopColor="#ffd45e" />
        </linearGradient>
      </defs>
    </svg>
  );
}
