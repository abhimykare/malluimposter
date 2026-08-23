"use client";

import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { MAX_PLAYER_NAME_LENGTH, useGameStore } from "@/store/game-store";

import { PlayerAvatar } from "./PlayerAvatar";

/**
 * Optional per-seat names. One 48px input per player; Enter/Next moves to the
 * following field. Names are persisted with the other preferences and frozen
 * into the round when it starts. The imposter is still chosen at random.
 */
export function PlayerNames({ className }: { className?: string }) {
  const { t } = useTranslation();
  const playerCount = useGameStore((s) => s.settings.playerCount);
  const names = useGameStore(useShallow((s) => s.settings.playerNames));
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const clearPlayerNames = useGameStore((s) => s.clearPlayerNames);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const hasAny = names.some((n) => n.trim() !== "");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="px-1 text-sm text-muted text-pretty">{t("playerNamesHint")}</p>
      <ol className="surface-card divide-y divide-border rounded-lg">
        {Array.from({ length: playerCount }, (_, index) => {
          const fallback = t("playerN", { n: index + 1 });
          const value = names[index] ?? "";
          return (
            <li key={index} className="flex items-center gap-3 px-3 py-1.5">
              <PlayerAvatar index={index} size="sm" name={value} />
              <label className="sr-only" htmlFor={`player-name-${index}`}>
                {t("nameFor", { player: fallback })}
              </label>
              <input
                id={`player-name-${index}`}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                value={value}
                placeholder={fallback}
                maxLength={MAX_PLAYER_NAME_LENGTH}
                autoComplete="off"
                autoCapitalize="words"
                enterKeyHint={index < playerCount - 1 ? "next" : "done"}
                onChange={(e) => setPlayerName(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const next = inputsRef.current[index + 1];
                    if (next) next.focus();
                    else e.currentTarget.blur();
                  }
                }}
                className="h-11 min-w-0 flex-1 rounded-sm bg-transparent px-2 text-base font-medium text-fg placeholder:text-faint focus:bg-surface-2 focus:outline-none"
              />
            </li>
          );
        })}
      </ol>
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-faint text-pretty">{t("imposterIsRandom")}</p>
        {hasAny && (
          <Button variant="ghost" size="sm" onClick={clearPlayerNames} className="shrink-0 -mr-2">
            {t("clearNames")}
          </Button>
        )}
      </div>
    </div>
  );
}
