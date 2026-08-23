"use client";

import type { ReactNode } from "react";

import { selectHasHydrated, useGameStore } from "@/store/game-store";

/**
 * Renders `fallback` until the persisted store has been rehydrated on the
 * client. This avoids flashing English copy at a Malayalam user (and vice
 * versa) and keeps server/client markup identical.
 */
export function HydrationGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hydrated = useGameStore(selectHasHydrated);
  return <>{hydrated ? children : fallback}</>;
}

export function useHydrated(): boolean {
  return useGameStore(selectHasHydrated);
}
