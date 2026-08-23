"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/game";
import { useGameStore } from "@/store/game-store";

const numberVariants = {
  enter: (dir: number) => ({ y: dir * 26, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir * -26, opacity: 0 }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Big, thumb-friendly player counter. Holding a button repeats the step.
 */
export function PlayerCounter({ className }: { className?: string }) {
  const { t } = useTranslation();
  const count = useGameStore((s) => s.settings.playerCount);
  const increment = useGameStore((s) => s.incrementPlayers);
  const decrement = useGameStore((s) => s.decrementPlayers);
  const reduced = useReducedMotion();
  const [direction, setDirection] = useState<1 | -1>(1);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdTimer.current = null;
    holdInterval.current = null;
  };

  // Never leave a repeat timer running after unmount.
  useEffect(() => stopHold, []);

  const startHold = (fn: () => void, dir: 1 | -1) => {
    stopHold();
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        // Stop at the bound in the hold direction (button becomes disabled there).
        const { playerCount } = useGameStore.getState().settings;
        if (dir < 0 ? playerCount <= MIN_PLAYERS : playerCount >= MAX_PLAYERS) {
          stopHold();
          return;
        }
        fn();
      }, 90);
    }, 420);
  };

  const onDecrement = () => {
    setDirection(-1);
    decrement();
  };
  const onIncrement = () => {
    setDirection(1);
    increment();
  };

  const canDecrement = count > MIN_PLAYERS;
  const canIncrement = count < MAX_PLAYERS;

  const stepButton =
    "flex size-14 shrink-0 items-center justify-center rounded-md bg-surface-2 text-fg ring-1 ring-inset ring-border-strong transition-[background-color,transform,opacity] duration-150 active:scale-95 hover:bg-surface-3 disabled:opacity-35 disabled:pointer-events-none motion-reduce:transition-none";

  return (
    <div
      className={cn("surface-card flex items-center justify-between gap-3 rounded-lg p-3 sm:p-4", className)}
      role="group"
      aria-label={t("playerCount")}
    >
      <button
        type="button"
        className={stepButton}
        aria-label={t("fewerPlayers")}
        disabled={!canDecrement}
        onClick={onDecrement}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startHold(onDecrement, -1);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <MinusIcon />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-center">
        <span className="sr-only" aria-live="polite" aria-atomic>
          {t("playerCount")}: {count}
        </span>
        <div className="relative h-14 w-24 overflow-hidden" aria-hidden>
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <m.span
              key={count}
              custom={direction}
              variants={reduced ? fadeVariants : numberVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center font-display text-5xl font-extrabold tabular text-fg"
            >
              {count}
            </m.span>
          </AnimatePresence>
        </div>
        <span className="eyebrow text-faint">
          {t("players")}
        </span>
      </div>

      <button
        type="button"
        className={stepButton}
        aria-label={t("morePlayers")}
        disabled={!canIncrement}
        onClick={onIncrement}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startHold(onIncrement, 1);
        }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
