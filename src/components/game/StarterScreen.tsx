"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/Button";
import { ChatIcon, SparklesIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import { usePlayerLabel } from "@/hooks/usePlayerLabel";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { randomInt } from "@/lib/random";
import { useGameStore } from "@/store/game-store";

import { GameHeader } from "./GameHeader";
import { PlayerAvatar } from "./PlayerAvatar";

/** Total spin time and the easing of the highlight steps (fast → slow). */
const SPIN_MS = 2200;
const MIN_STEP_MS = 70;
const MAX_STEP_MS = 320;

/**
 * "Who starts?" — a roulette-style highlight hops across the player avatars,
 * slows down, and lands on the randomly chosen starter (decided in the store
 * the moment the last card was hidden; the animation only presents it).
 */
export function StarterScreen() {
  const { t } = useTranslation();
  const labelFor = usePlayerLabel();
  const reduced = useReducedMotion();
  const { playerCount, starterIndex, names } = useGameStore(
    useShallow((s) => ({
      playerCount: s.round?.playerCount ?? 0,
      starterIndex: s.starterIndex,
      names: s.round?.playerNames ?? [],
    })),
  );
  const beginDiscussion = useGameStore((s) => s.beginDiscussion);

  const [highlight, setHighlight] = useState<number | null>(reduced ? starterIndex : null);
  const [done, setDone] = useState<boolean>(Boolean(reduced));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduced || starterIndex === null || playerCount === 0) return;
    const start = performance.now();
    let index = randomInt(playerCount);
    let cancelled = false;

    const hop = () => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / SPIN_MS);
      // Ease-out: steps get longer as we approach the end.
      const stepMs = MIN_STEP_MS + (MAX_STEP_MS - MIN_STEP_MS) * progress * progress;
      if (progress >= 1) {
        // Land on the real starter.
        setHighlight(starterIndex);
        setDone(true);
        haptics.reveal();
        return;
      }
      index = (index + 1) % playerCount;
      // Near the end, make sure we approach the starter from the right side
      // so the final hop lands naturally.
      if (progress > 0.85 && index === starterIndex) {
        setHighlight(starterIndex);
        setDone(true);
        haptics.reveal();
        return;
      }
      setHighlight(index);
      if (elapsed > 0 && index % 2 === 0) haptics.tap();
      timerRef.current = setTimeout(hop, stepMs);
    };
    timerRef.current = setTimeout(hop, MIN_STEP_MS);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reduced, starterIndex, playerCount]);

  const starterLabel = starterIndex !== null ? labelFor(starterIndex) : "";
  const cols = playerCount <= 4 ? 2 : playerCount <= 9 ? 3 : playerCount <= 16 ? 4 : 5;

  return (
    <Screen width="narrow" withBottomBar>
      <GameHeader>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted">
          <SparklesIcon size={16} />
          {t("whoStarts")}
        </span>
      </GameHeader>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4 text-center">
        <div className="min-h-[4.5rem]">
          <AnimatePresence mode="wait" initial={false}>
            {done && starterIndex !== null ? (
              <m.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
                role="status"
              >
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl text-balance">
                  {t("starterChosen", { player: starterLabel })}
                </h1>
                <p className="mt-2 text-muted">{t("starterHint")}</p>
              </m.div>
            ) : (
              <m.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                  {t("whoStarts")}
                </h1>
                <p className="mt-2 text-muted" aria-live="polite">
                  {t("pickingStarter")}
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <ul
          className="grid w-full max-w-sm gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {Array.from({ length: playerCount }, (_, index) => {
            const active = highlight === index;
            const isStarter = done && index === starterIndex;
            return (
              <li key={index} className="flex flex-col items-center gap-1.5">
                <m.div
                  animate={
                    isStarter
                      ? { scale: 1.18, opacity: 1 }
                      : active
                        ? { scale: 1.1, opacity: 1 }
                        : { scale: 1, opacity: done ? 0.35 : 0.75 }
                  }
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  className={cn(
                    "rounded-full transition-shadow duration-150",
                    (active || isStarter) && "shadow-glow-accent ring-4 ring-accent",
                  )}
                >
                  <PlayerAvatar index={index} size={playerCount > 12 ? "md" : "lg"} name={names[index]} />
                </m.div>
                <span
                  className={cn(
                    "max-w-full truncate text-xs font-semibold",
                    isStarter ? "text-accent" : active ? "text-fg" : "text-faint",
                  )}
                >
                  {labelFor(index)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <BottomBar width="narrow">
        <Button
          size="lg"
          fullWidth
          onClick={beginDiscussion}
          disabled={!done}
          leadingIcon={<ChatIcon size={20} />}
        >
          {t("startDiscussion")}
        </Button>
      </BottomBar>
    </Screen>
  );
}
