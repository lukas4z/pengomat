import { Countdown } from "./Countdown";
import { Peng } from "./Peng";
import { StageTree } from "./StageTree";
import { Window } from "./scene/Window";
import { Wordmark } from "./Wordmark";

export function Hero() {
  return (
    <header className="hero">
      <Wordmark />
      <p className="tagline"><span className="tagline__text">Weihnachtswichteln 2026</span></p>
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
