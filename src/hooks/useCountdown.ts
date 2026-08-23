"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CountdownStatus = "running" | "paused" | "done";

type CountdownState = {
  status: CountdownStatus;
  remainingMs: number;
};

/**
 * A drift-free countdown based on an absolute end timestamp. A single
 * interval ticks the UI; the real remaining time is always recomputed from
 * the clock, so background tabs and throttled timers stay accurate.
 *
 * The countdown starts on mount. To restart it from the outside, remount the
 * consuming component (e.g. with a `key`). Everything is cleaned up on unmount.
 */
export function useCountdown(durationMs: number) {
  const [state, setState] = useState<CountdownState>(() => ({
    status: "running",
    remainingMs: durationMs,
  }));
  const endAtRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(durationMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const tick = useCallback(() => {
    if (endAtRef.current === null) return;
    const remaining = Math.max(0, endAtRef.current - Date.now());
    if (remaining <= 0) {
      clear();
      setState({ status: "done", remainingMs: 0 });
      return;
    }
    setState((prev) =>
      prev.status === "running" && Math.ceil(prev.remainingMs / 1000) === Math.ceil(remaining / 1000)
        ? prev
        : { status: "running", remainingMs: remaining },
    );
  }, [clear]);

  const startInterval = useCallback(() => {
    clear();
    intervalRef.current = setInterval(tick, 200);
  }, [clear, tick]);

  // Start the clock on mount; only refs/timers are touched here (no setState).
  useEffect(() => {
    endAtRef.current = Date.now() + durationMs;
    startInterval();
    return clear;
  }, [durationMs, startInterval, clear]);

  // Re-sync immediately when the tab becomes visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && intervalRef.current) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [tick]);

  const pause = useCallback(() => {
    if (endAtRef.current === null) return;
    pausedRemainingRef.current = Math.max(0, endAtRef.current - Date.now());
    clear();
    setState((prev) =>
      prev.status === "running" ? { status: "paused", remainingMs: pausedRemainingRef.current } : prev,
    );
  }, [clear]);

  const resume = useCallback(() => {
    endAtRef.current = Date.now() + pausedRemainingRef.current;
    startInterval();
    setState((prev) =>
      prev.status === "paused" ? { status: "running", remainingMs: pausedRemainingRef.current } : prev,
    );
  }, [startInterval]);

  const restart = useCallback(() => {
    endAtRef.current = Date.now() + durationMs;
    startInterval();
    setState({ status: "running", remainingMs: durationMs });
  }, [durationMs, startInterval]);

  return {
    status: state.status,
    remainingMs: state.remainingMs,
    remainingSeconds: Math.ceil(state.remainingMs / 1000),
    progress: durationMs > 0 ? 1 - state.remainingMs / durationMs : 1,
    pause,
    resume,
    restart,
  };
}
