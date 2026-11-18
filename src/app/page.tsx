import { Room } from "@/components/scene/Room";
import { Window } from "@/components/scene/Window";
import { Wordmark } from "@/components/Wordmark";
import { Peng } from "@/components/Peng";
import { Countdown } from "@/components/Countdown";
import { ThemeSwitch } from "@/components/ThemeProvider";

export default function Home() {
  return (
    <Room>
      <header className="hero">
        <Wordmark />
        <p className="tagline">Peng lost aus. Du schenkst.</p>
        <div className="stage">
          <Window />
          <Peng pose="header" />
        </div>
        <Countdown />
        <p className="countdown-note">bis zum Wichteln am 26. Dezember</p>
      </header>

      <section className="card">
        <Peng pose="form" className="card__peng" />
        <div className="tag"><small>Budget</small>wird noch festgelegt</div>
        <h2>Dein Wunschzettel</h2>
        <p className="card__lead">Trag dich ein – Peng kümmert sich um den Rest.</p>
        <form>
          <div className="field">
            <label htmlFor="name">Wie heißt du?</label>
            <input id="name" name="name" autoComplete="given-name" placeholder="Dein Name" />
          </div>
          <div className="field">
            <label htmlFor="wish1">Was wünschst du dir?</label>
            <textarea id="wish1" name="wish1" placeholder="z. B. warme Socken, ein gutes Buch …" />
            <p className="field__hint">Deinen Wunsch sieht nur, wer dich zieht.</p>
          </div>
          <button type="button" className="link">+ noch ein Wunsch</button>
          <button type="button" className="btn btn--wide">Ab in die Socke damit</button>
        </form>
      </section>
      <ThemeSwitch />
    </Room>
  );
}
