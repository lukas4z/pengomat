"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { THEMES, type Theme } from "@/lib/skin";

const DEFAULT: Theme = process.env.NEXT_PUBLIC_STIL === "film" ? "film" : "sticker";
const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: DEFAULT, setTheme: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

function read(): Theme {
  try {
    const q = new URLSearchParams(window.location.search).get("stil");
    if (q && THEMES.includes(q as Theme)) return q as Theme;
    const s = window.localStorage.getItem("pengomat-stil");
    if (s && THEMES.includes(s as Theme)) return s as Theme;
  } catch {}
  return DEFAULT;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, set] = useState<Theme>(DEFAULT);
  useEffect(() => set(read()), []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const setTheme = (t: Theme) => {
    set(t);
    try {
      window.localStorage.setItem("pengomat-stil", t);
    } catch {}
  };
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

/** Preview-only switch between the two looks. */
export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-switch" role="group" aria-label="Stil wählen">
      {THEMES.map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)}>
          {t === "sticker" ? "Sticker" : "Film"}
        </button>
      ))}
    </div>
  );
}
