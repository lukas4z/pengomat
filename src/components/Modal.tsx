"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** A small cozy popup on top of the page. */
export function Modal({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} className="dialog" aria-label={label} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog__body">{children}</div>
    </dialog>
  );
}
