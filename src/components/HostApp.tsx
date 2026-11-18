"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, errorText, hostApi, personalLink } from "@/lib/client";
import { LIMITS, type HostParticipant, type HostView } from "@/lib/types";
import { Hero } from "./Hero";
import { Modal } from "./Modal";
import { ParticipantApp } from "./ParticipantApp";
import { Fireplace } from "./scene/Fireplace";
import { Room } from "./scene/Room";
import { Sock } from "./scene/Sock";
import { useSound } from "./SoundProvider";
import { ThemeSwitch } from "./ThemeProvider";

const POLL_MS = 5000;
const when = (iso: string) => `${new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" }).format(new Date(iso))} um ${new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso))} Uhr`;

type Dialog = { kind: "sock"; id: string } | { kind: "draw" } | { kind: "reset" } | { kind: "pairs" } | null;

export function HostApp({ hostKey }: { hostKey: string }) {
  const api = useRef(hostApi(hostKey)).current;
  const { play } = useSound();
  const [view, setView] = useState<HostView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [sync, setSync] = useState(0);
  const [budget, setBudget] = useState("");
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [resetWord, setResetWord] = useState("");
  const [pairList, setPairList] = useState<{ giver: string; receiver: string }[] | null>(null);
  const known = useRef<Set<string> | null>(null);
  const budgetDirty = useRef(false);

  const apply = useCallback(
    (v: HostView) => {
      const ids = new Set(v.participants.map((p) => p.id));
      if (known.current) {
        const added = [...ids].filter((id) => !known.current!.has(id));
        if (added.length) {
          play("bell");
          setFresh(new Set(added));
        }
      }
      known.current = ids;
      setView(v);
      setError(null);
      if (!budgetDirty.current) setBudget(v.budget);
    },
    [play],
  );

  const run = useCallback(
    async (fn: () => Promise<HostView>) => {
      setBusy(true);
      try {
        apply(await fn());
        setSync((s) => s + 1);
        return true;
      } catch (err) {
        setError(errorText(err instanceof ApiError ? err.code : "server"));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [apply],
  );

  useEffect(() => {
    const load = () => api.view().then(apply, (err) => setError(errorText(err instanceof ApiError ? err.code : "server")));
    load();
    const id = window.setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [api, apply]);

  const close = () => {
    setDialog(null);
    setNewLink(null);
    setConfirmRemove(false);
    setResetWord("");
    setPairList(null);
  };

  const people = view?.participants ?? [];
  const drawn = view?.phase === "drawn";
  const selected: HostParticipant | undefined = dialog?.kind === "sock" ? people.find((p) => p.id === dialog.id) : undefined;
  const n = people.length;

  return (
    <Room>
      <div className="layout">
        <Hero />
        <div className="layout__side">
          <ParticipantApp sync={sync} />
        </div>
      </div>

      <section className="host" aria-label="Gastgeber-Bereich">
        <h2 className="section-title">Wer ist schon dabei?</h2>
        <p className="section-sub" role="status">
          {!view ? "Peng zählt nach …" : n === 0 ? "Noch hängt keine Socke am Kamin." : n === 1 ? "1 Wichtel hat seine Socke aufgehängt." : `${n} Wichtel haben ihre Socke aufgehängt.`}
        </p>
        {error && <p className="host__error" role="alert">{error}</p>}

        <Fireplace>
          {people.map((p, i) => (
            <Sock key={p.id} name={p.name} index={i} isNew={fresh.has(p.id)} onClick={() => setDialog({ kind: "sock", id: p.id })} />
          ))}
        </Fireplace>
        {n > 0 && <p className="host__hint">Tipp auf eine Socke, um mehr zu sehen.</p>}

        <div className="hostpanel">
          <h3>Budget</h3>
          {drawn ? (
            <p className="hostpanel__fixed">{view?.budget || "Kein Budget festgelegt"}</p>
          ) : (
            <form
              className="hostpanel__row"
              onSubmit={async (e) => {
                e.preventDefault();
                if (await run(() => api.setBudget(budget))) {
                  budgetDirty.current = false;
                  setBudgetSaved(true);
                  window.setTimeout(() => setBudgetSaved(false), 2500);
                }
              }}
            >
              <input
                aria-label="Budget"
                value={budget}
                maxLength={LIMITS.budgetMax}
                placeholder="z. B. 15 €"
                onChange={(e) => {
                  budgetDirty.current = true;
                  setBudget(e.target.value);
                }}
              />
              <button type="submit" className="btn btn--small" disabled={busy}>{budgetSaved ? "Gespeichert!" : "Speichern"}</button>
            </form>
          )}

          <h3>Auslosung</h3>
          {drawn ? (
            <>
            <p className="hostpanel__fixed">Ausgelost am {view?.drawnAt ? when(view.drawnAt) : "–"}. Alle finden ihr Geschenk, wenn sie die Seite öffnen.{view?.sameGroupGifts ? ` ${view.sameGroupGifts} Wichtel mussten jemanden vom selben Handy ziehen, weil es nicht anders aufging.` : ""}</p>
            <button type="button" className="link" onClick={() => setDialog({ kind: "pairs" })}>Wer beschenkt wen? (nur bei Problemen)</button>
            </>
          ) : (
            <>
              <p className="hostpanel__text">Wenn alle ihre Socke aufgehängt haben, lost Peng aus. Niemand zieht sich selbst – und auch du siehst nicht, wer wen hat.</p>
              <button type="button" className="btn btn--green btn--wide" disabled={n < LIMITS.drawMin || busy} onClick={() => setDialog({ kind: "draw" })}>
                Jetzt auslosen
              </button>
              {n < LIMITS.drawMin && <p className="hostpanel__note">Mindestens 3 Wichtel nötig.</p>}
              {view?.groupTooBig && <p className="hostpanel__note">Hinweis: Über ein Handy sind mehr als die Hälfte aller Wichtel eingetragen. Dann müssen sich einige davon gegenseitig ziehen.</p>}
            </>
          )}
        </div>

        <button type="button" className="host__reset" onClick={() => setDialog({ kind: "reset" })}>Alles zurücksetzen (Probelauf)</button>
      </section>

      {dialog?.kind === "sock" && selected && (
        <Modal label={`Socke von ${selected.name}`} onClose={close}>
          <h2>{selected.name}</h2>
          <p>Eingetragen am {when(selected.joinedAt)}.</p>
          <p>{selected.wishCount === 1 ? "Hat 1 Wunsch hinterlegt." : `Hat ${selected.wishCount} Wünsche hinterlegt.`} Was drinsteht, bleibt geheim.</p>
          {newLink ? (
            <div className="linkbox">
              <h3>Neuer Link für {selected.name}</h3>
              <p>Der alte Link funktioniert nicht mehr. Schick diesen weiter:</p>
              <input readOnly value={newLink} onFocus={(e) => e.currentTarget.select()} aria-label="Neuer persönlicher Link" />
              <div className="linkbox__actions">
                <button type="button" className="btn btn--quiet btn--small" onClick={() => navigator.clipboard?.writeText(newLink).catch(() => {})}>Link kopieren</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="link"
              disabled={busy}
              onClick={async () => {
                try {
                  setNewLink(personalLink((await api.reissue(selected.id)).token));
                } catch (err) {
                  setError(errorText(err instanceof ApiError ? err.code : "server"));
                }
              }}
            >
              Neuen persönlichen Link erzeugen
            </button>
          )}
          <div className="actions">
            {!drawn &&
              (confirmRemove ? (
                <button type="button" className="btn btn--small" disabled={busy} onClick={async () => (await run(() => api.remove(selected.id))) && close()}>
                  Wirklich entfernen
                </button>
              ) : (
                <button type="button" className="btn btn--quiet btn--small" onClick={() => setConfirmRemove(true)}>Entfernen</button>
              ))}
            <button type="button" className="btn btn--quiet btn--small" onClick={close}>Schließen</button>
          </div>
        </Modal>
      )}

      {dialog?.kind === "draw" && (
        <Modal label="Auslosen" onClose={close}>
          <h2>Sind alle da?</h2>
          <p>{n} Wichtel sind eingetragen. Nach der Auslosung kann sich niemand mehr eintragen – das lässt sich nicht rückgängig machen.</p>
          <div className="actions">
            <button type="button" className="btn btn--green btn--small" disabled={busy} onClick={async () => { await run(() => api.draw()); close(); }}>
              Ja, auslosen!
            </button>
            <button type="button" className="btn btn--quiet btn--small" onClick={close}>Noch nicht</button>
          </div>
        </Modal>
      )}

      {dialog?.kind === "pairs" && (
        <Modal label="Wer beschenkt wen" onClose={close}>
          <h2>Wer beschenkt wen?</h2>
          {pairList ? (
            <ul className="pairs">
              {pairList.map((p) => (
                <li key={p.giver}><strong>{p.giver}</strong> <span aria-hidden>→</span><span className="sr-only"> beschenkt </span> {p.receiver}</li>
              ))}
            </ul>
          ) : (
            <>
              <p>Achtung, Spoiler: Hier steht die komplette Auslosung – auch, wer dich beschenkt. Schau nur rein, wenn es ein Problem gibt.</p>
              <div className="actions">
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={async () => {
                    try {
                      setPairList(await api.pairs());
                    } catch (err) {
                      setError(errorText(err instanceof ApiError ? err.code : "server"));
                    }
                  }}
                >
                  Trotzdem anzeigen
                </button>
              </div>
            </>
          )}
          <div className="actions">
            <button type="button" className="btn btn--quiet btn--small" onClick={close}>Schließen</button>
          </div>
        </Modal>
      )}

      {dialog?.kind === "reset" && (
        <Modal label="Alles zurücksetzen" onClose={close}>
          <h2>Alles zurücksetzen?</h2>
          <p>Das löscht alle Wichtel, ihre Wünsche und die Auslosung. Das Budget bleibt. Gedacht für einen Probelauf.</p>
          <div className="field">
            <label htmlFor="reset-word">Tippe PENG, um zu bestätigen</label>
            <input id="reset-word" value={resetWord} autoComplete="off" onChange={(e) => setResetWord(e.target.value)} />
          </div>
          <div className="actions">
            <button type="button" className="btn btn--small" disabled={resetWord !== "PENG" || busy} onClick={async () => { await run(() => api.reset()); close(); }}>
              Zurücksetzen
            </button>
            <button type="button" className="btn btn--quiet btn--small" onClick={close}>Abbrechen</button>
          </div>
        </Modal>
      )}
      <ThemeSwitch />
    </Room>
  );
}
