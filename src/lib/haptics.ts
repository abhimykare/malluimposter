/** Tiny, optional haptic feedback helpers (no-ops where unsupported). */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}

export const haptics = {
  tap: () => vibrate(8),
  reveal: () => vibrate([12, 40, 18]),
  result: () => vibrate([20, 60, 20, 60, 40]),
};
