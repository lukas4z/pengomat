"use client";
import { FilmTree } from "./scene/Room";
import { useTheme } from "./ThemeProvider";

/** The decorated tree beside the window (film look only; the sticker look has no tree picture). */
export function StageTree() {
  const { theme } = useTheme();
  return theme === "film" ? <FilmTree className="stage__tree" /> : null;
}
