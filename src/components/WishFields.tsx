"use client";
import { LIMITS } from "@/lib/types";

/** One or more wish inputs (up to LIMITS.wishesMax); the first is required. */
export function WishFields({ wishes, onChange, error, idPrefix = "wish" }: { wishes: string[]; onChange: (w: string[]) => void; error?: string; idPrefix?: string }) {
  const set = (i: number, v: string) => onChange(wishes.map((w, k) => (k === i ? v : w)));
  return (
    <>
      {wishes.map((w, i) => (
        <div className="field" key={i}>
          <label htmlFor={`${idPrefix}${i}`}>{i === 0 ? "Was wünschst du dir?" : `Wunsch ${i + 1}`}</label>
          <div className="field__row">
            <textarea
              id={`${idPrefix}${i}`}
              value={w}
              maxLength={LIMITS.wishMax}
              rows={2}
              placeholder={i === 0 ? "z. B. warme Socken, ein gutes Buch …" : "Noch eine Idee …"}
              aria-invalid={i === 0 && !!error}
              aria-describedby={i === 0 ? `${idPrefix}-hint` : undefined}
              onChange={(e) => set(i, e.target.value)}
            />
            {i > 0 && (
              <button type="button" className="field__remove" aria-label={`Wunsch ${i + 1} entfernen`} onClick={() => onChange(wishes.filter((_, k) => k !== i))}>
                ×
              </button>
            )}
          </div>
          {i === 0 && error && <p className="field__error" role="alert">{error}</p>}
          {i === 0 && <p className="field__hint" id={`${idPrefix}-hint`}>Deinen Wunsch sieht nur, wer dich zieht.</p>}
        </div>
      ))}
      {wishes.length < LIMITS.wishesMax && (
        <button type="button" className="link" onClick={() => onChange([...wishes, ""])}>
          + noch ein Wunsch
        </button>
      )}
    </>
  );
}

export function checkWishes(wishes: string[]): string | undefined {
  if (!wishes.some((w) => w.trim())) return "Schreib bitte mindestens einen Wunsch auf.";
  return undefined;
}
