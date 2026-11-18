import { Room } from "@/components/scene/Room";
import { Fireplace } from "@/components/scene/Fireplace";
import { Sock } from "@/components/scene/Sock";
import { Gift } from "@/components/scene/Gift";
import { Peng } from "@/components/Peng";
import { ThemeSwitch } from "@/components/ThemeProvider";

const NAMES = ["Oma Inge", "Lukas", "Mia", "Opa Karl", "Jonas", "Tante Bärbel"];

export default function Design() {
  return (
    <Room>
      <h2 className="section-title">Wer ist schon dabei?</h2>
      <p className="section-sub">6 Wichtel haben ihre Socke aufgehängt</p>
      <Fireplace>
        {NAMES.map((n, i) => <Sock key={n} name={n} index={i} />)}
      </Fireplace>
      <h2 className="section-title">Schüttel mich!</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <Gift />
        <Gift open />
      </div>
      <section className="card" style={{ textAlign: "center" }}>
        <Peng pose="done" className="card__peng" />
        <h2 style={{ marginTop: 40 }}>Du bist dabei, Mia!</h2>
        <p className="card__lead">Peng hat deinen Wunschzettel in die Socke gesteckt.</p>
      </section>
      <ThemeSwitch />
    </Room>
  );
}
