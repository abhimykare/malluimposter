"use client";

import { IconButton } from "@/components/ui/IconButton";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameStore } from "@/store/game-store";

/**
 * Toggles between dark and light. Both icons are rendered and CSS shows the
 * right one from `<html data-theme>` so the server markup is correct before
 * hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const theme = useGameStore((s) => s.theme);
  const setTheme = useGameStore((s) => s.setTheme);
  const systemLight = useMediaQuery("(prefers-color-scheme: light)");

  const isLight = theme === "light" || (theme === "system" && systemLight);

  return (
    <IconButton
      label={`${t("theme")}: ${isLight ? t("themeDark") : t("themeLight")}`}
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className={className}
      aria-pressed={isLight}
    >
      <SunIcon data-theme-icon="dark" />
      <MoonIcon data-theme-icon="light" />
    </IconButton>
  );
}
