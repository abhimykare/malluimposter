"use client";

import { m } from "framer-motion";
import { useEffect, useRef } from "react";

import { IconButton } from "@/components/ui/IconButton";
import { PauseIcon, PlayIcon, RefreshIcon } from "@/components/ui/icons";
import { useCountdown } from "@/hooks/useCountdown";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/game";

type TimerProps = {
  minutes: number;
  className?: string;
};

/**
 * Discussion countdown with pause / resume / restart and a progress track.
 * Mount with a `key` (e.g. the round id) to restart it for a new round.
 */
export function Timer({ minutes, className }: TimerProps) {
  const { t } = useTranslation();
  const durationMs = minutes * 60_000;
  const { status, remainingSeconds, progress, pause, resume, restart } = useCountdown(durationMs);
  const vibratedRef = useRef(false);

  // Gentle haptic nudge when time runs out (where supported).
  useEffect(() => {
    if (status === "done" && !vibratedRef.current) {
      vibratedRef.current = true;
      try {
        navigator.vibrate?.([120, 60, 120]);
      } catch {
        /* ignore */
      }
    }
    if (status !== "done") vibratedRef.current = false;
  }, [status]);

  const urgent = status === "running" && remainingSeconds <= 10;
  const done = status === "done";

  return (
    <section
      className={cn("surface-card relative overflow-hidden rounded-lg p-5 text-center", className)}
      aria-label={t("discussionTimer")}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-surface-2" aria-hidden>
        <m.div
          className={cn("h-full", done ? "bg-imposter" : urgent ? "bg-imposter" : "bg-accent")}
          initial={false}
          animate={{ width: `${Math.round((1 - progress) * 100)}%` }}
          transition={{ duration: 0.25, ease: "linear" }}
        />
      </div>
      <span
        className={cn(
          "eyebrow",
          done ? "text-imposter" : "text-faint",
        )}
      >
        {done ? t("timeUp") : status === "paused" ? t("timerPaused") : t("timerRunning")}
      </span>
      <div
        role="timer"
        aria-live={done ? "assertive" : "off"}
        aria-atomic
        className={cn(
          "mt-1 font-display text-6xl font-extrabold tabular tracking-tight transition-colors sm:text-7xl",
          done || urgent ? "text-imposter" : "text-fg",
          urgent && "animate-pulse motion-reduce:animate-none",
        )}
      >
        {formatClock(remainingSeconds)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {!done && (
          <IconButton
            label={status === "paused" ? t("resume") : t("pause")}
            variant="surface"
            size="lg"
            onClick={status === "paused" ? resume : pause}
          >
            {status === "paused" ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
        )}
        <IconButton label={t("restartTimer")} variant="surface" size="lg" onClick={restart}>
          <RefreshIcon />
        </IconButton>
      </div>
    </section>
  );
}
