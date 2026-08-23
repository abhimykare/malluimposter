"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslation } from "@/hooks/useTranslation";
import { useGameStore } from "@/store/game-store";

/**
 * Maps a seat index to its display label: the custom name given in setup
 * (frozen per round), or the localised "Player N".
 */
export function usePlayerLabel(): (index: number) => string {
  const { t } = useTranslation();
  const names = useGameStore(useShallow((s) => s.round?.playerNames ?? s.settings.playerNames));
  return useCallback((index: number) => names[index]?.trim() || t("playerN", { n: index + 1 }), [names, t]);
}
