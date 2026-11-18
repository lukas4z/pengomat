"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, clearToken, errorText, getToken, getTokens, setToken } from "@/lib/client";
import type { Me, PublicState } from "@/lib/types";
import { Card } from "./Card";
import { Confirmation } from "./Confirmation";
import { JoinForm } from "./JoinForm";
import { Reveal } from "./Reveal";

const POLL_MS = 15000;
type Person = { token: string; me: Me };

/** The part of the page that depends on who is on this device and whether the draw has happened. */
export function ParticipantApp({ sync = 0 }: { sync?: number }) {
  const [pub, setPub] = useState<PublicState | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const phase = useRef<string | null>(null);
  const allMatched = useRef(false);

  const load = useCallback(async (withPeople: boolean) => {
    try {
      const state = await api.state();
      const changed = phase.current !== null && phase.current !== state.phase;
      phase.current = state.phase;
      setPub(state);
      setError(null);
      const tokens = getTokens();
      // also retry while the draw is done but someone on this device has not received their match yet
      if (tokens.length && (withPeople || changed || (state.phase === "drawn" && !allMatched.current))) {
        const results = await Promise.all(
          tokens.map((token) =>
            api.me(token).then(
              (me): Person | "gone" => ({ token, me }),
              (err) => {
                if (err instanceof ApiError && err.code === "unauthorized") return "gone" as const;
                throw err;
              },
            ),
          ),
        );
        const here = results.filter((r): r is Person => r !== "gone");
        tokens.filter((_, i) => results[i] === "gone").forEach((t) => clearToken(t));
        if (!here.length && state.phase === "signup") setNotice("Dein Eintrag wurde entfernt – trag dich gern nochmal ein.");
        allMatched.current = here.length > 0 && here.every((p) => p.me.match);
        setPeople(here);
        setActive(getToken());
      } else if (!tokens.length) {
        setPeople([]);
        setActive(null);
      }
    } catch (err) {
      setError(errorText(err instanceof ApiError ? err.code : "server"));
    }
  }, []);

  useEffect(() => {
    // personal link: ?t=<token> adds that person to this device, then disappears from the address bar
    let linkToken: string | null = null;
    try {
      const url = new URL(window.location.href);
      linkToken = url.searchParams.get("t");
      if (linkToken) {
        url.searchParams.delete("t");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    } catch {}
    (async () => {
      if (linkToken) {
        // a dead link changes nothing; a working one joins the people already on this device without replacing them
        const before = getToken();
        const works = (t: string) => api.me(t).then(() => true, () => false);
        if (await works(linkToken)) {
          const keep = before && before !== linkToken && (await works(before)) ? before : null;
          setToken(linkToken);
          if (keep) setToken(keep);
        }
      }
      await load(true);
    })();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load(false);
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && load(true);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  useEffect(() => {
    if (sync > 0) load(true);
  }, [sync, load]);

  if (!pub) {
    return (
      <Card pose="sleep" mood="sleep" className="card--in card--center">
        {error ? (
          <>
            <h2>Hoppla</h2>
            <p className="card__lead">{error}</p>
            <button type="button" className="btn btn--wide" onClick={() => load(true)}>Nochmal versuchen</button>
          </>
        ) : (
          <p className="card__lead" role="status">Peng schaut kurz nach …</p>
        )}
      </Card>
    );
  }

  const current = people.find((p) => p.token === active) ?? people[0];
  const choose = (token: string) => {
    setToken(token);
    setActive(token);
    setAdding(false);
    setFresh(false);
  };
  const switcher = people.length > 1 && (
    <div className="people" role="group" aria-label="Wer ist gerade dran?">
      <span className="people__label">Auf diesem Gerät:</span>
      {people.map((p) => (
        <button key={p.token} type="button" className="people__chip" aria-pressed={!adding && p.token === current?.token} onClick={() => choose(p.token)}>
          {p.me.name}
        </button>
      ))}
    </div>
  );

  if (pub.phase === "drawn") {
    const drawn = people.filter((p) => p.me.match);
    if (drawn.length) {
      // everyone on this device, one below the other, each with their own present
      return (
        <>
          {drawn.length > 1 && <p className="people__label people__label--solo">Auf diesem Gerät sind {drawn.length} Wichtel – jede Person beschenkt jemand eigenen:</p>}
          {drawn.map((p, i) => (
            <Reveal key={p.me.id} me={p.me} owner={drawn.length > 1 ? p.me.name : undefined} autoOpen={i === 0} />
          ))}
        </>
      );
    }
    return (
      <Card pose="nap" mood="sleep" className="card--in card--center">
        <h2>Die Auslosung ist schon gelaufen</h2>
        <p className="card__lead">Warst du eingetragen? Dann öffne deinen persönlichen Link – oder frag die Gastgeberin nach einem neuen.</p>
      </Card>
    );
  }

  if (current && !adding && !leaving) {
    return (
      <>
        {switcher}
        <Confirmation
          key={current.me.id}
          me={{ ...current.me, budget: pub.budget }}
          token={current.token}
          fresh={fresh}
          onChange={(me) => setPeople((list) => list.map((p) => (p.token === current.token ? { ...p, me } : p)))}
          onAdd={() => {
            setFresh(false);
            setAdding(true);
          }}
        />
      </>
    );
  }

  return (
    <>
      {switcher}
      <JoinForm
        key={people.length}
        budget={pub.budget}
        notice={notice}
        leaving={leaving}
        another={people.length > 0}
        onCancel={() => setAdding(false)}
        onJoined={(me, token) => {
          setToken(token);
          setNotice(null);
          setFresh(true);
          setLeaving(true);
          setPeople((list) => [...list, { token, me }]);
          setActive(token);
          window.setTimeout(() => {
            setLeaving(false);
            setAdding(false);
          }, 520);
        }}
      />
    </>
  );
}
