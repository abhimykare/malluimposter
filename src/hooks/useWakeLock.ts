"use client";

import { useEffect } from "react";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener?: (t: string, cb: () => void) => void };

/**
 * Keeps the screen awake while a round is active (where supported), so the
 * phone does not lock while it is being passed around. Re-acquires the lock
 * when the tab becomes visible again. Purely progressive enhancement.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        if (document.visibilityState !== "visible") return;
        const next = await nav.wakeLock!.request("screen");
        if (cancelled) {
          // Cleanup ran while we were waiting — release immediately.
          void next.release().catch(() => {});
          return;
        }
        sentinel = next;
      } catch {
        sentinel = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !cancelled) void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}
