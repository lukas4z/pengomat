"use client";
import { useEffect, useState } from "react";

export const EVENT_DATE = "2026-12-26T00:00:00+01:00";

export function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = now === null ? null : new Date(EVENT_DATE).getTime() - now;
  if (left !== null && left <= 0) return <p className="countdown countdown--now">Heute wird gewichtelt!</p>;
  const s = left === null ? 0 : Math.floor(left / 1000);
  const parts: [string, number][] = [["Tage", Math.floor(s / 86400)], ["Std", Math.floor(s / 3600) % 24], ["Min", Math.floor(s / 60) % 60], ["Sek", s % 60]];
  return (
    <div className="countdown" role="timer" aria-label="Zeit bis zum Wichteln am 26. Dezember">
      {parts.map(([label, n]) => (
        <div key={label} className="countdown__tile">
          <span key={label === "Sek" ? n : label} className={`countdown__n${label === "Sek" && left !== null ? " countdown__n--tick" : ""}`}>{left === null ? "–" : String(n).padStart(2, "0")}</span>
          <span className="countdown__l">{label}</span>
        </div>
      ))}
    </div>
  );
}
