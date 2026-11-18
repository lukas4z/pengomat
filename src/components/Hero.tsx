import { Countdown } from "./Countdown";
import { Peng } from "./Peng";
import { StageTree } from "./StageTree";
import { Window } from "./scene/Window";
import { Wordmark } from "./Wordmark";

const TAGLINE = "Weihnachtswichteln 2026";

export function Hero() {
  return (
    <header className="hero">
      <Wordmark />
      <p className="tagline" aria-label={TAGLINE}>
        {Array.from(TAGLINE).map((c, i) => (
          <span key={i} className="tagline__l" style={{ ["--i" as string]: i }} aria-hidden>
            {c === " " ? "\u00a0" : c}
          </span>
        ))}
      </p>
      <div className="stage">
        <Window />
        <StageTree />
        <Peng pose="look" />
      </div>
      <Countdown />
      <p className="countdown-note">bis zum Wichteln am 26. Dezember</p>
    </header>
  );
}
