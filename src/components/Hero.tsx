import { Countdown } from "./Countdown";
import { Peng } from "./Peng";
import { Window } from "./scene/Window";
import { Wordmark } from "./Wordmark";

export function Hero() {
  return (
    <header className="hero">
      <Wordmark />
      <p className="tagline">Peng lost aus. Du schenkst.</p>
      <div className="stage">
        <Window />
        <Peng pose="look" />
      </div>
      <Countdown />
      <p className="countdown-note">bis zum Wichteln am 26. Dezember</p>
    </header>
  );
}
