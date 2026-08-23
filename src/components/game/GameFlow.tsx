"use client";

import { AnimatePresence, m } from "framer-motion";

import { HydrationGate } from "@/components/layout/HydrationGate";
import { Screen } from "@/components/ui/Screen";
import { useWakeLock } from "@/hooks/useWakeLock";
import type { GamePhase } from "@/lib/game";
import { selectPhase, useGameStore } from "@/store/game-store";

import { DiscussionScreen } from "./DiscussionScreen";
import { ResultScreen } from "./ResultScreen";
import { RevealScreen } from "./RevealScreen";
import { SetupScreen } from "./SetupScreen";
import { VotingScreen } from "./VotingScreen";

/**
 * Receives the phase as a prop (rather than reading the store) so that the
 * element AnimatePresence keeps around while exiting continues to render the
 * OLD screen; otherwise the exiting wrapper would re-render as the new screen
 * and swallow taps made during the transition.
 */
function PhaseScreen({ phase }: { phase: GamePhase }) {
  switch (phase) {
    case "setup":
      return <SetupScreen />;
    case "revealing":
      return <RevealScreen />;
    case "discussion":
      return <DiscussionScreen />;
    case "voting":
      return <VotingScreen />;
    case "result":
      return <ResultScreen />;
    default:
      return <SetupScreen />;
  }
}

/**
 * The whole round is a state-driven flow on a single route: no secrets ever
 * touch the URL, and transitions are instant.
 */
export function GameFlow() {
  const phase = useGameStore(selectPhase);
  useWakeLock(phase !== "setup");
  return (
    <HydrationGate fallback={<Screen width="narrow">{null}</Screen>}>
      <AnimatePresence mode="wait" initial={false}>
        {/* Opacity-only: a transform here would re-parent the fixed bottom bars. */}
        <m.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeIn" } }}
          className="min-h-dvh"
        >
          <PhaseScreen phase={phase} />
        </m.div>
      </AnimatePresence>
    </HydrationGate>
  );
}
