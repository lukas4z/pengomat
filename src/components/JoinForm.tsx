"use client";
import { useState, type FormEvent } from "react";
import { api, ApiError, errorText } from "@/lib/client";
import { LIMITS, type Me } from "@/lib/types";
import { Card } from "./Card";
import { useSound } from "./SoundProvider";
import { checkWishes, WishFields } from "./WishFields";

export function JoinForm({ budget, notice, leaving, another = false, withToken, onCancel, onJoined }: { budget: string; withToken?: string; notice?: string | null; leaving: boolean; another?: boolean; onCancel?: () => void; onJoined: (me: Me, token: string) => void }) {
  const { play } = useSound();
  const [name, setName] = useState("");
  const [wishes, setWishes] = useState([""]);
  const [errors, setErrors] = useState<{ name?: string; wishes?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const n = name.trim();
    const next: typeof errors = {};
    if (Array.from(n).length < LIMITS.nameMin) next.name = another ? "Wie heißt die Person? (mindestens 2 Buchstaben)" : "Wie dürfen wir dich nennen? (mindestens 2 Buchstaben)";
    next.wishes = checkWishes(wishes);
    setErrors(next);
    if (next.name || next.wishes) return;
    setBusy(true);
    try {
      const { token, me } = await api.join(n, wishes, another ? withToken : undefined);
      play("bell");
      onJoined(me, token);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "server";
      if (code === "name_taken") setErrors({ name: errorText(code) });
      else setErrors({ form: errorText(code) });
      setBusy(false);
    }
  }

  return (
    <Card pose="sleep" mood="sleep" budget={budget} className={leaving ? "card--leaving" : "card--in"}>
      <h2>{another ? "Noch ein Wunschzettel" : "Dein Wunschzettel"}</h2>
      {another && <p className="card__lead">Für wen trägst du noch ein? Zum Beispiel für ein Kind ohne eigenes Handy. Wer über dasselbe Handy eingetragen ist, zieht sich nicht gegenseitig.</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="name">{another ? "Wie heißt die Person?" : "Wie heißt du?"}</label>
          <input id="name" value={name} maxLength={LIMITS.nameMax} autoComplete="given-name" placeholder={another ? "Name" : "Dein Name"} aria-invalid={!!errors.name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="field__error" role="alert">{errors.name}</p>}
        </div>
        <WishFields wishes={wishes} onChange={setWishes} error={errors.wishes} />
        {errors.form && <p className="field__error" role="alert">{errors.form}</p>}
        <button type="submit" className="btn btn--wide" disabled={busy}>
          {busy ? "Peng packt ein …" : "Ab in die Socke damit"}
        </button>
        {another && onCancel && (
          <button type="button" className="link link--center" onClick={onCancel}>Doch nicht – zurück</button>
        )}
      </form>
    </Card>
  );
}
