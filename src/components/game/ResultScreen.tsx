"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/ui/Confetti";
import { HomeIcon, MaskIcon, RefreshIcon, SlidersIcon, TrophyIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { haptics } from "@/lib/haptics";
import { useGameStore } from "@/store/game-store";

import { GameHeader } from "./GameHeader";
import { PlayerAvatar } from "./PlayerAvatar";
import { wordSizeClass } from "./RevealCard";

const STEP_DELAYS = [1100, 1300, 1100];
const MAX_STEP = 3;

const pop = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
};

export function ResultScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const reduced = useReducedMotion();

  const { result, secretWord, round } = useGameStore(
    useShallow((s) => ({ result: s.result, secretWord: s.secretWord, round: s.round })),
  );
  const playAgain = useGameStore((s) => s.playAgain);
  const backToSetup = useGameStore((s) => s.backToSetup);
  const requestExit = useGameStore((s) => s.requestExit);

  const [step, setStep] = useState(reduced ? MAX_STEP : 0);

  // Auto-advance the reveal sequence; a tap skips ahead.
  useEffect(() => {
    if (step >= MAX_STEP) return;
    const id = setTimeout(() => setStep((s) => Math.min(MAX_STEP, s + 1)), STEP_DELAYS[step] ?? 1000);
    return () => clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step === 1) haptics.reveal();
    if (step === MAX_STEP) haptics.result();
  }, [step]);

  if (!result || !secretWord || !round) {
    return (
      <Screen width="narrow" center>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-fg">{t("roundLost")}</h1>
          <Button className="mt-6" onClick={() => backToSetup()}>
            {t("changeSettings")}
          </Button>
        </div>
      </Screen>
    );
  }

  const groupWon = result.outcome === "group";
  const imposterLabel = t("playerN", { n: result.imposterIndex + 1 });
  const votedLabel = t("playerN", { n: result.votedIndex + 1 });
  const advance = () => setStep((s) => Math.min(MAX_STEP, s + 1));

  const onPlayAgain = () => {
    void playAgain().then((r) => {
      if (!r.ok) backToSetup();
    });
  };

  return (
    <Screen width="narrow" withBottomBar={step >= MAX_STEP ? "tall" : false}>
      <GameHeader confirmExit={false}>
        <span className="text-sm font-semibold text-muted">{t("roundOver")}</span>
      </GameHeader>

      {step >= MAX_STEP && groupWon && <Confetti />}

      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 py-3 text-center"
        onClick={step < MAX_STEP ? advance : undefined}
        role={step < MAX_STEP ? "button" : undefined}
        tabIndex={step < MAX_STEP ? 0 : undefined}
        onKeyDown={(e) => {
          if (step < MAX_STEP && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            advance();
          }
        }}
        aria-label={step < MAX_STEP ? t("tapToContinue") : undefined}
      >
        {/* Step 0: "The imposter was…" */}
        <m.h1
          {...pop}
          className={cn(
            "font-display text-2xl font-bold tracking-tight text-muted transition-opacity sm:text-3xl",
            step >= 1 && "text-lg sm:text-xl",
          )}
        >
          {t("theImposterWas")}
        </m.h1>

        {/* Step 1: imposter identity */}
        <AnimatePresence>
          {step >= 1 && (
            <m.div
              key="imposter"
              {...pop}
              className="flex w-full max-w-xs flex-col items-center gap-2 rounded-xl bg-[linear-gradient(160deg,#3a0c1a,#150508)] px-5 py-4 ring-2 ring-inset ring-imposter shadow-glow-imposter"
            >
              <PlayerAvatar index={result.imposterIndex} size="lg" variant="imposter" />
              <span className="font-display text-2xl font-extrabold text-white sm:text-3xl">{imposterLabel}</span>
              <span className="eyebrow inline-flex items-center gap-1.5 text-imposter">
                <MaskIcon size={14} /> {t("imposter")}
              </span>
            </m.div>
          )}
        </AnimatePresence>

        {/* Step 2: the word (+ clue) */}
        <AnimatePresence>
          {step >= 2 && (
            <m.div key="word" {...pop} className="w-full max-w-xs">
              <p className="mb-2 text-sm font-semibold text-muted">{t("theWordWas")}</p>
              <div className="rounded-xl bg-[linear-gradient(160deg,#062f2c,#04110f)] px-5 py-4 ring-2 ring-inset ring-word shadow-glow-word">
                <span className="eyebrow text-word">{t("secretWord")}</span>
                <p
                  className={cn(
                    "mt-1 break-words font-display font-extrabold leading-[1.1] tracking-tight text-white text-balance",
                    wordSizeClass(secretWord.word, language),
                  )}
                >
                  {secretWord.word}
                </p>
                {round.imposterClueEnabled && (
                  <div className="mt-3 border-t border-white/10 pt-2.5">
                    <span className="eyebrow text-white/60">
                      {t("imposterClueLabel")}
                    </span>
                    <p className="mt-0.5 text-lg font-bold text-white/90">{secretWord.clue}</p>
                  </div>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* Step 3: outcome */}
        <AnimatePresence>
          {step >= 3 && (
            <m.div
              key="outcome"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={cn(
                "flex w-full max-w-xs flex-col items-center gap-1 rounded-lg px-5 py-3",
                groupWon ? "bg-success-soft text-success" : "bg-imposter-soft text-imposter",
              )}
              role="status"
            >
              <span className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight sm:text-2xl">
                {groupWon ? <TrophyIcon size={24} /> : <MaskIcon size={24} />}
                {groupWon ? t("groupWon") : t("imposterWon")}
              </span>
              <span className="text-sm font-medium text-fg/80 text-balance">
                {groupWon
                  ? t("groupWonBody", { player: imposterLabel })
                  : t("imposterWonBody", { voted: votedLabel, imposter: imposterLabel })}
              </span>
            </m.div>
          )}
        </AnimatePresence>

        {step < MAX_STEP && (
          <p className="mt-2 text-xs font-medium text-faint">{t("tapToContinue")}</p>
        )}
      </div>

      {step >= MAX_STEP && (
        <BottomBar width="narrow">
          <Button size="lg" fullWidth onClick={onPlayAgain} leadingIcon={<RefreshIcon size={20} />}>
            {t("playAgain")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={backToSetup} leadingIcon={<SlidersIcon size={16} />}>
              {t("changeSettings")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                requestExit();
                router.push("/");
              }}
              leadingIcon={<HomeIcon size={16} />}
            >
              {t("home")}
            </Button>
          </div>
        </BottomBar>
      )}
    </Screen>
  );
}
