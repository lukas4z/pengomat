import { Ornament } from "./scene/Ornament";

/** "Pengomat" with the o as a Christmas bauble. */
export function Wordmark() {
  const before = ["P", "e", "n", "g"];
  const after = ["m", "a", "t"];
  return (
    <h1 className="wordmark" aria-label="Pengomat">
      {before.map((c, i) => (
        <span key={i} className="wordmark__l" style={{ ["--i" as string]: i }} aria-hidden>{c}</span>
      ))}
      <span className="wordmark__o" style={{ ["--i" as string]: 4 }} aria-hidden>
        <Ornament color="red" />
      </span>
      {after.map((c, i) => (
        <span key={i} className="wordmark__l" style={{ ["--i" as string]: i + 5 }} aria-hidden>{c}</span>
      ))}
    </h1>
  );
}
