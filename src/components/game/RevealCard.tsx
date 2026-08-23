"use client";

import { m, useReducedMotion } from "framer-motion";

import { Logo } from "@/components/brand/Logo";
import { EyeIcon, MaskIcon } from "@/components/ui/icons";
import type { Language } from "@/data/types";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import type { RevealCard as RevealCardData } from "@/store/game-store";

import { PlayerAvatar } from "./PlayerAvatar";

/** Picks a display size that keeps long words (esp. Malayalam) on the card. */
export function wordSizeClass(word: string, language: Language): string {
  const units = language === "ml" ? Math.ceil([...word].length * 0.62) : word.length;
  if (units <= 7) return "text-[2.75rem] sm:text-6xl";
  if (units <= 11) return "text-4xl sm:text-5xl";
  if (units <= 15) return "text-3xl sm:text-4xl";
  return "text-2xl sm:text-3xl";
}

type RevealCardProps = {
  playerIndex: number;
  /** Display label (custom name or "Player N"). */
  playerName: string;
  /** Custom name for the avatar initial ("" = show the seat number). */
  avatarName?: string;
  /** null while face-down; the secret is only passed once revealed. */
  card: RevealCardData | null;
  revealed: boolean;
  onReveal: () => void;
  className?: string;
};

/**
 * The secret card. Face-down it is a large tap target; tapping flips it to
 * reveal either the secret word or the imposter role. The face-up content is
 * only mounted once revealed so nothing secret exists in the DOM beforehand.
 */
export function RevealCard({ playerIndex, playerName, avatarName, card, revealed, onReveal, className }: RevealCardProps) {
  const { t, language } = useTranslation();
  const reduced = useReducedMotion();

  const flip = reduced
    ? { front: { opacity: revealed ? 0 : 1 }, back: { opacity: revealed ? 1 : 0 }, container: {} }
    : {
        front: { opacity: 1 },
        back: { opacity: 1 },
        container: { rotateY: revealed ? 180 : 0 },
      };

  return (
    <div className={cn("relative mx-auto w-full max-w-[22rem] [perspective:1400px]", className)}>
      <m.div
        className="relative aspect-[3/4] w-full [transform-style:preserve-3d]"
        animate={flip.container}
        transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
      >
        {/* Front (face-down) */}
        <m.button
          type="button"
          onClick={onReveal}
          disabled={revealed}
          aria-label={t("tapToReveal")}
          animate={flip.front}
          transition={{ duration: 0.2 }}
          className={cn(
            "card-back-pattern absolute inset-0 flex flex-col items-center justify-center gap-5 overflow-hidden rounded-xl p-6 text-center ring-1 ring-inset ring-border-strong shadow-lg",
            "[backface-visibility:hidden] [-webkit-backface-visibility:hidden]",
            "transition-transform duration-150 active:scale-[0.985] motion-reduce:transition-none",
            revealed && "pointer-events-none",
          )}
        >
          <Logo size={44} className="opacity-60" />
          <PlayerAvatar index={playerIndex} size="lg" name={avatarName} />
          <span className="max-w-full truncate px-2 font-display text-2xl font-extrabold text-fg">{playerName}</span>
          <span className="relative mt-2 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-on-accent shadow-glow-accent">
            {!revealed && (
              <span
                aria-hidden
                className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40 motion-reduce:hidden [animation-duration:1.8s]"
              />
            )}
            <EyeIcon size={18} />
            {t("tapToReveal")}
          </span>
          <span className="text-sm text-muted">{t("tapToRevealHint")}</span>
        </m.button>

        {/* Back (face-up) — only has content once revealed */}
        <m.div
          aria-live="polite"
          aria-atomic
          initial={reduced ? { opacity: 0 } : false}
          animate={flip.back}
          transition={{ duration: 0.2 }}
          // Reduced motion: no 3D flip at all — the back face simply fades in.
          // (Inline style so it reliably overrides the rotateY utility.)
          style={reduced ? { transform: "none", backfaceVisibility: "visible" } : undefined}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center rounded-xl p-6 text-center shadow-lg",
            "[backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]",
            !revealed && "pointer-events-none",
            card?.kind === "imposter"
              ? "bg-[linear-gradient(160deg,#3a0c1a,#150508)] ring-2 ring-inset ring-imposter shadow-glow-imposter"
              : "bg-[linear-gradient(160deg,#062f2c,#04110f)] ring-2 ring-inset ring-word shadow-glow-word",
          )}
        >
          {revealed && card && (
            <>
              <span className="absolute top-4 left-0 right-0 flex items-center justify-center gap-2 text-xs font-semibold text-white/60">
                <PlayerAvatar index={playerIndex} size="sm" className="!size-6 !text-[0.7rem]" name={avatarName} />
                <span className="max-w-[60%] truncate">{playerName}</span>
              </span>
              {card.kind === "imposter" ? (
                <ImposterFace clue={card.clue} />
              ) : (
                <WordFace word={card.word} language={language} />
              )}
            </>
          )}
        </m.div>
      </m.div>
    </div>
  );
}

function WordFace({ word, language }: { word: string; language: Language }) {
  const { t } = useTranslation();
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.18, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center gap-4"
    >
      <span className="eyebrow text-word">{t("yourWord")}</span>
      <p
        className={cn(
          "w-full max-w-full break-words font-display font-extrabold leading-[1.1] tracking-tight text-white text-balance",
          wordSizeClass(word, language),
        )}
      >
        {word}
      </p>
      <p className="mt-2 text-sm text-white/70">{t("dontSayWord")}</p>
    </m.div>
  );
}

function ImposterFace({ clue }: { clue: string | null }) {
  const { t, language } = useTranslation();
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.18, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center gap-4"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-imposter/20 text-imposter ring-1 ring-inset ring-imposter/50">
        <MaskIcon size={30} />
      </span>
      <p className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-4xl">
        {t("youAreTheImposter")}
      </p>
      {clue ? (
        <div className="mt-1 w-full rounded-lg bg-white/8 px-4 py-3 ring-1 ring-inset ring-white/12">
          <span className="eyebrow text-imposter">{t("clue")}</span>
          <p
            className={cn(
              "mt-1 break-words font-display font-extrabold leading-tight text-white text-balance",
              wordSizeClass(clue, language) === "text-[2.75rem] sm:text-6xl" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
            )}
          >
            {clue}
          </p>
        </div>
      ) : null}
      <p className="text-sm text-white/70 text-pretty">{clue ? t("imposterWithClue") : t("imposterNoClue")}</p>
    </m.div>
  );
}
