"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { I18nText } from "@/components/i18n/I18nText";
import { Button, LinkButton } from "@/components/ui/Button";
import { PlayIcon } from "@/components/ui/icons";
import { useGameStore } from "@/store/game-store";

/**
 * Primary home actions. Server-renders "Start Game"; once hydrated, offers to
 * resume a round that is still in memory (e.g. after pressing back).
 */
export function HomeActions() {
  const router = useRouter();
  const phase = useGameStore((s) => s.phase);
  const hydrated = useGameStore((s) => s._hasHydrated);
  const resetRound = useGameStore((s) => s.resetRound);
  const exitRequested = useGameStore((s) => s.exitRequested);
  const roundInProgress = hydrated && phase !== "setup" && !exitRequested;

  // A round the player explicitly exited is discarded once we are home.
  useEffect(() => {
    if (exitRequested) resetRound();
  }, [exitRequested, resetRound]);

  const startNew = () => {
    resetRound();
    router.push("/game");
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {roundInProgress ? (
        <>
          <LinkButton href="/game" size="lg" fullWidth leadingIcon={<PlayIcon size={20} />}>
            <I18nText k="continue" />
          </LinkButton>
          <Button variant="secondary" size="md" fullWidth onClick={startNew}>
            <I18nText k="startGame" />
          </Button>
        </>
      ) : (
        <LinkButton href="/game" size="lg" fullWidth leadingIcon={<PlayIcon size={20} />}>
          <I18nText k="startGame" />
        </LinkButton>
      )}
      <LinkButton href="/how-to-play" variant="secondary" size="md" fullWidth>
        <I18nText k="howToPlay" />
      </LinkButton>
    </div>
  );
}
