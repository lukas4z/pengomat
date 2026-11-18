"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, clearToken, errorText, getToken, setToken } from "@/lib/client";
import type { Me, PublicState } from "@/lib/types";
import { Card } from "./Card";
import { Confirmation } from "./Confirmation";
import { JoinForm } from "./JoinForm";
import { Reveal } from "./Reveal";

const POLL_MS = 15000;

/** The part of the page that depends on who you are and whether the draw has happened. */
export function ParticipantApp({ sync = 0 }: { sync?: number }) {
  const [pub, setPub] = useState<PublicState | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fresh, setFresh] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const phase = useRef<string | null>(null);

  const load = useCallback(async (withMe: boolean) => {
    try {
      const state = await api.state();
      const changed = phase.current !== null && phase.current !== state.phase;
      phase.current = state.phase;
      setPub(state);
      setError(null);
      const token = getToken();
      if (token && (withMe || changed)) {
        try {
          setMe(await api.me(token));
        } catch (err) {
          if (err instanceof ApiError && err.code === "unauthorized") {
            clearToken();
            setMe(null);
            if (state.phase === "signup") setNotice("Dein Eintrag wurde entfernt – trag dich gern nochmal ein.");
          } else throw err;
        }
      } else if (!token) setMe(null);
    } catch (err) {
      setError(errorText(err instanceof ApiError ? err.code : "server"));
    }
  }, []);

  useEffect(() => {
    // personal link: ?t=<token> signs this device in, then disappears from the address bar
    try {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("t");
      if (t) {
        setToken(t);
        url.searchParams.delete("t");
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    } catch {}
    load(true);
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

  if (pub.phase === "drawn") {
    if (me?.match) return <Reveal me={me} />;
    return (
      <Card pose="nap" mood="sleep" className="card--in card--center">
        <h2>Die Auslosung ist schon gelaufen</h2>
        <p className="card__lead">Warst du eingetragen? Dann öffne deinen persönlichen Link – oder frag die Gastgeberin nach einem neuen.</p>
      </Card>
    );
  }

  if (me && !leaving) return <Confirmation me={{ ...me, budget: pub.budget }} fresh={fresh} onChange={setMe} />;

  return (
    <JoinForm
      budget={pub.budget}
      notice={notice}
      leaving={leaving}
      onJoined={(joined) => {
        setNotice(null);
        setFresh(true);
        setLeaving(true);
        setMe(joined);
        window.setTimeout(() => setLeaving(false), 520);
      }}
    />
  );
}
