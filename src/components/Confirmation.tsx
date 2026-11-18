"use client";
import { useState } from "react";
import { api, ApiError, errorText, getToken, personalLink } from "@/lib/client";
import type { Me } from "@/lib/types";
import { Card } from "./Card";
import { checkWishes, WishFields } from "./WishFields";

export function PersonalLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const link = personalLink(token);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.getElementById("personal-link") as HTMLInputElement | null;
      el?.select();
    }
  }
  return (
    <div className="linkbox">
      <h3>Dein persönlicher Link</h3>
      <p>Damit kommst du auch auf einem anderen Gerät wieder rein. Am besten gleich an dich selbst schicken – aber nicht an andere weitergeben.</p>
      <input id="personal-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Dein persönlicher Link" />
      <div className="linkbox__actions">
        <button type="button" className="btn btn--quiet btn--small" onClick={copy}>{copied ? "Kopiert!" : "Link kopieren"}</button>
        {canShare && (
          <button type="button" className="btn btn--quiet btn--small" onClick={() => navigator.share({ title: "Mein Pengomat-Link", url: link }).catch(() => {})}>
            Link teilen
          </button>
        )}
      </div>
    </div>
  );
}

export function Confirmation({ me, fresh, onChange }: { me: Me; fresh: boolean; onChange: (me: Me) => void }) {
  const token = getToken();
  const [editing, setEditing] = useState(false);
  const [wishes, setWishes] = useState(me.wishes);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function save() {
    const problem = checkWishes(wishes);
    setError(problem);
    if (problem || !token) return;
    setBusy(true);
    try {
      onChange(await api.updateWishes(token, wishes));
      setEditing(false);
    } catch (err) {
      setError(errorText(err instanceof ApiError ? err.code : "server"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card pose="header" mood={fresh ? "wake" : "awake"} budget={me.budget} className="card--in" sparkle={fresh}>
      <h2>Du bist dabei, {me.name}!</h2>
      <p className="card__lead">Dein Wunschzettel steckt in der Socke. Sobald alle da sind, lost Peng aus – schau dann einfach wieder hier vorbei.</p>
      {editing ? (
        <>
          <WishFields wishes={wishes} onChange={setWishes} error={error} idPrefix="edit" />
          <div className="actions">
            <button type="button" className="btn btn--small" disabled={busy} onClick={save}>{busy ? "Speichert …" : "Speichern"}</button>
            <button type="button" className="btn btn--quiet btn--small" onClick={() => { setEditing(false); setWishes(me.wishes); setError(undefined); }}>Abbrechen</button>
          </div>
        </>
      ) : (
        <div className="wishes">
          <h3>Deine Wünsche</h3>
          <ul>{me.wishes.map((w, i) => <li key={i}>{w}</li>)}</ul>
          <button type="button" className="link" onClick={() => { setWishes(me.wishes); setEditing(true); }}>Wünsche ändern</button>
        </div>
      )}
      {token && <PersonalLink token={token} />}
    </Card>
  );
}
