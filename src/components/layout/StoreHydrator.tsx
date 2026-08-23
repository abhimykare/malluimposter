"use client";

import { useEffect } from "react";

import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/site";
import { useGameStore } from "@/store/game-store";

function applyTheme(theme: "dark" | "light" | "system") {
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = resolved === "light" ? THEME_COLOR_LIGHT : THEME_COLOR_DARK;
}

/**
 * Rehydrates the persisted store on the client (hydration is skipped during
 * SSR to keep server and client markup identical) and mirrors theme/language
 * preferences onto <html> so CSS and assistive tech stay in sync.
 */
export function StoreHydrator() {
  useEffect(() => {
    void useGameStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const sync = () => {
      const state = useGameStore.getState();
      applyTheme(state.theme);
      document.documentElement.setAttribute("lang", state.settings.language);
    };
    sync();
    const unsubscribe = useGameStore.subscribe(sync);
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onMedia = () => {
      if (useGameStore.getState().theme === "system") sync();
    };
    media.addEventListener("change", onMedia);
    return () => {
      unsubscribe();
      media.removeEventListener("change", onMedia);
    };
  }, []);

  return null;
}
