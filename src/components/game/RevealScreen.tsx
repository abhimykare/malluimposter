"use client";

import { AnimatePresence, m } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/Button";
import { EyeOffIcon, EyeIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import { useTranslation } from "@/hooks/useTranslation";
import { haptics } from "@/lib/haptics";
import { selectCurrentReveal, useGameStore } from "@/store/game-store";

import { GameHeader } from "./GameHeader";
import { PlayerAvatar } from "./PlayerAvatar";
import { RevealCard } from "./RevealCard";

type Stage = "pass" | "ready" | "revealed";

const slide = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.985 },
  transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as const },
};

/**
 * Per-player reveal flow: pass → ready (face-down card) → revealed → hide.
 * Keyed by seat index by the parent so local state resets for each player.
 */
function RevealStage({ playerIndex, total }: { playerIndex: number; total: number }) {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>("pass");
  const advanceReveal = useGameStore((s) => s.advanceReveal);
  // Only read the secret once the card is actually revealed.
  const card = useGameStore(useShallow((s) => (stage === "revealed" ? selectCurrentReveal(s) : null)));

  // Anti-peek: if the app is backgrounded while a role is visible, hide it.
  useEffect(() => {
    if (stage !== "revealed") return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setStage("ready");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [stage]);

  const hideAndPass = useCallback(() => {
    setStage("pass");
    advanceReveal();
  }, [advanceReveal]);

  const label = t("playerN", { n: playerIndex + 1 });

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center py-4">
        <AnimatePresence mode="wait" initial={false}>
          {stage === "pass" ? (
            <m.div key="pass" {...slide} className="flex w-full max-w-sm flex-col items-center text-center">
              <PlayerAvatar index={playerIndex} size="xl" className="mb-5" />
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">{label}</h1>
              <p className="mt-4 text-lg text-muted text-balance">{t("passPhoneTo", { player: label })}</p>
              <p className="mt-1 text-base text-faint text-balance">{t("makeSureNobodyLooking")}</p>
            </m.div>
          ) : (
            <m.div key="card" {...slide} className="w-full">
              <RevealCard
                playerIndex={playerIndex}
                card={card}
                revealed={stage === "revealed"}
                onReveal={() => {
                  haptics.reveal();
                  setStage("revealed");
                }}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <BottomBar width="narrow">
        {stage === "pass" && (
          <Button size="lg" fullWidth onClick={() => setStage("ready")} leadingIcon={<EyeIcon size={20} />}>
            {t("revealMyRole")}
          </Button>
        )}
        {stage === "ready" && <p className="text-center text-sm text-faint">{t("makeSureNobodyLooking")}</p>}
        {stage === "revealed" && (
          <Button
            size="lg"
            fullWidth
            variant="secondary"
            onClick={hideAndPass}
            leadingIcon={<EyeOffIcon size={20} />}
            className="bg-surface"
          >
            {t("hideAndPass")}
          </Button>
        )}
      </BottomBar>
    </>
  );
}

export function RevealScreen() {
  const { t } = useTranslation();
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const total = useGameStore((s) => s.round?.playerCount ?? 0);
  const progress = total > 0 ? currentPlayerIndex / total : 0;

  return (
    <Screen width="narrow" withBottomBar>
      <GameHeader>
        <span className="text-sm font-semibold text-muted tabular">
          {t("revealProgress", { current: Math.min(currentPlayerIndex + 1, total), total })}
        </span>
      </GameHeader>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <m.div
          className="h-full rounded-full bg-accent"
          initial={false}
          animate={{ width: `${Math.max(4, progress * 100)}%` }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <RevealStage key={currentPlayerIndex} playerIndex={currentPlayerIndex} total={total} />
    </Screen>
  );
}
