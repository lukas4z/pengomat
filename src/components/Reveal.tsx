"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getFlag, setFlag } from "@/lib/client";
import type { Me } from "@/lib/types";
import { Card, Sparkles } from "./Card";
import { Peng } from "./Peng";
import { Gift } from "./scene/Gift";
import { useSound } from "./SoundProvider";

const NEEDED = 3;
const COOLDOWN_MS = 600;
const SHAKE_FORCE = 11; // m/s² beyond gravity; a firm shake reaches 15–30, carrying the phone stays under 5

type MotionCtor = typeof DeviceMotionEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

function Match({ me, owner }: { me: Me; owner?: string }) {
  const match = me.match!;
  return (
    <>
      <p className="match__pre">{owner ? `${owner} beschenkt` : "Du beschenkst"}</p>
      <p className="match__name">{match.name}</p>
      <div className="wishes">
        <h3>{match.wishes.length > 1 ? "Das wünscht sich " : "Das wünscht sich "}{match.name}</h3>
        <ul>{match.wishes.map((w, i) => <li key={i}>{w}</li>)}</ul>
      </div>
      <p className="match__budget">Budget: <strong>{me.budget || "nach Gefühl"}</strong></p>
    </>
  );
}

/** After the draw: a present to shake three times, then the result. */
export function Reveal({ me, owner, autoOpen = true }: { me: Me; owner?: string; autoOpen?: boolean }) {
  const { play } = useSound();
  const flag = `pengomat-revealed-${me.id}`;
  const [seen, setSeen] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [shakes, setShakes] = useState(0);
  const [tick, setTick] = useState(0);
  const [unwrapped, setUnwrapped] = useState(false);
  const last = useRef(0);
  const count = useRef(0);
  const drag = useRef<{ x: number; dir: number; turns: number } | null>(null);
  const listening = useRef(false);
  // iPhones only deliver motion after the person allowed it with a tap
  const [needsMotionOk, setNeedsMotionOk] = useState(false);

  useEffect(() => {
    const s = getFlag(flag);
    setSeen(s);
    setOpen(!s && autoOpen);
  }, [flag, autoOpen]);

  const shake = useCallback(() => {
    const now = Date.now();
    if (count.current >= NEEDED || now - last.current < COOLDOWN_MS) return;
    last.current = now;
    count.current += 1;
    setShakes(count.current);
    setTick((t) => t + 1);
    play("rattle");
    try {
      navigator.vibrate?.(60);
    } catch {}
    if (count.current === NEEDED) {
      window.setTimeout(() => {
        play("pop");
        setUnwrapped(true);
        setFlag(flag, true);
      }, 750);
    }
  }, [flag, play]);

  const onMotion = useCallback(
    (e: DeviceMotionEvent) => {
      // prefer the sensor value without gravity; otherwise subtract gravity from the total
      const a = e.acceleration;
      const g = e.accelerationIncludingGravity;
      let force = 0;
      if (a && a.x !== null && a.y !== null && a.z !== null) force = Math.hypot(a.x, a.y, a.z);
      else if (g && g.x !== null && g.y !== null && g.z !== null) force = Math.abs(Math.hypot(g.x, g.y, g.z) - 9.81);
      if (force > SHAKE_FORCE) shake();
    },
    [shake],
  );

  const listen = useCallback(() => {
    if (listening.current) return;
    listening.current = true;
    window.addEventListener("devicemotion", onMotion);
  }, [onMotion]);

  // Always listen: where no permission is needed (most Android phones) shaking works right away.
  // iPhones stay silent until the person allows motion with a tap, so ask and show a button if that is still open.
  useEffect(() => {
    if (!open || typeof DeviceMotionEvent === "undefined") return;
    listen();
    const ctor = DeviceMotionEvent as MotionCtor;
    if (typeof ctor.requestPermission === "function") {
      ctor.requestPermission().then((r) => setNeedsMotionOk(r !== "granted"), () => setNeedsMotionOk(true));
    }
    return () => {
      window.removeEventListener("devicemotion", onMotion);
      listening.current = false;
    };
  }, [open, listen, onMotion]);

  function askMotion() {
    const ctor = typeof DeviceMotionEvent !== "undefined" ? (DeviceMotionEvent as MotionCtor) : null;
    if (ctor && typeof ctor.requestPermission === "function") {
      ctor
        .requestPermission()
        .then((r) => {
          if (r === "granted") {
            listen();
            setNeedsMotionOk(false);
          }
        })
        .catch(() => {});
    }
  }

  function restart() {
    count.current = 0;
    last.current = 0;
    setShakes(0);
    setUnwrapped(false);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setSeen(true);
  }

  if (seen === null) return null;

  return (
    <>
      {seen ? (
        <Card pose="reveal" className="card--in card--center">
          <Match me={me} owner={owner} />
          <button type="button" className="link" onClick={restart}>Nochmal auspacken</button>
        </Card>
      ) : (
        <Card pose="look" className="card--in card--center">
          <h2>{owner ? `Ein Geschenk für ${owner}` : "Peng hat ausgelost!"}</h2>
          <p className="card__lead">{owner ? `Pack aus, wen ${owner} beschenkt.` : `Dein Geschenk wartet auf dich, ${me.name}.`}</p>
          <button type="button" className="btn btn--wide" onClick={() => setOpen(true)}>Geschenk auspacken</button>
        </Card>
      )}

      {open && (
        <div className="reveal" role="dialog" aria-modal="true" aria-label="Dein Wichtel-Geschenk">
          {!unwrapped ? (
            <div className="reveal__stage">
              {owner && <p className="reveal__owner">Geschenk für {owner}</p>}
              <h2 className="reveal__title">{shakes === 0 ? "Schüttel mich!" : shakes < NEEDED ? "Nochmal!" : "Oh!"}</h2>
              <button
                type="button"
                className="reveal__gift"
                aria-label="Geschenk schütteln"
                onClick={askMotion}
                onPointerDown={(e) => {
                  drag.current = { x: e.clientX, dir: 0, turns: 0 };
                  shake();
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (!d) return;
                  const dx = e.clientX - d.x;
                  if (Math.abs(dx) < 14) return;
                  const dir = Math.sign(dx);
                  if (d.dir && dir !== d.dir) d.turns += 1;
                  d.dir = dir;
                  d.x = e.clientX;
                  if (d.turns >= 2) {
                    d.turns = 0;
                    shake();
                  }
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    shake();
                  }
                }}
              >
                <Gift shake={shakes as 0 | 1 | 2 | 3} open={shakes >= NEEDED} tick={tick} />
              </button>
              <div className="reveal__bells" aria-label={`${shakes} von ${NEEDED} Mal geschüttelt`}>
                {Array.from({ length: NEEDED }, (_, i) => (
                  <span key={i} className={`bell${i < shakes ? " bell--on" : ""}`} />
                ))}
              </div>
              <p className="reveal__hint">Handy schütteln oder aufs Geschenk tippen – drei Mal.</p>
              {needsMotionOk && (
                <button type="button" className="btn btn--quiet btn--small reveal__motion" onClick={askMotion}>Handy-Schütteln erlauben</button>
              )}
            </div>
          ) : (
            <div className="reveal__result">
              <Sparkles />
              <Peng pose="reveal" className="reveal__peng" />
              <div className="reveal__card">
                <Match me={me} owner={owner} />
                <button type="button" className="btn btn--wide" onClick={close}>Alles klar!</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
