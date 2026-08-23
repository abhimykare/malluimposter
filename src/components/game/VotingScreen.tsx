"use client";

import { m } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";

import { GameHeader } from "./GameHeader";
import { PlayerAvatar } from "./PlayerAvatar";

function VoteCard({
  index,
  selected,
  onSelect,
  label,
  selectedLabel,
  delay,
}: {
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
  label: string;
  selectedLabel: string;
  delay: number;
}) {
  return (
    <m.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(index)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-lg p-3 text-center transition-[background-color,box-shadow] duration-150",
        selected
          ? "bg-imposter-soft ring-2 ring-inset ring-imposter shadow-glow-imposter"
          : "surface-card hover:bg-surface-2",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full transition-colors",
          selected ? "bg-imposter text-on-imposter" : "bg-surface-2 text-transparent ring-1 ring-inset ring-border-strong",
        )}
      >
        <CheckIcon size={14} strokeWidth={3} />
      </span>
      <PlayerAvatar index={index} size="lg" variant={selected ? "imposter" : "default"} />
      <span className="min-w-0">
        <span className="block truncate text-[0.95rem] font-semibold leading-tight text-fg">{label}</span>
        <span className={cn("block text-xs font-medium leading-tight", selected ? "text-imposter" : "text-transparent")}>
          {selected ? selectedLabel : "·"}
        </span>
      </span>
    </m.button>
  );
}

export function VotingScreen() {
  const { t } = useTranslation();
  const playerCount = useGameStore((s) => s.round?.playerCount ?? 0);
  const selectedVote = useGameStore((s) => s.selectedVote);
  const selectVote = useGameStore((s) => s.selectVote);
  const revealResult = useGameStore((s) => s.revealResult);

  return (
    <Screen width="wide" withBottomBar>
      <GameHeader />
      <div className="px-1 text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {t("whoIsTheImposter")}
        </h1>
        <p className="mt-2 text-muted text-balance">{t("votingHint")}</p>
      </div>

      <div
        role="radiogroup"
        aria-label={t("whoIsTheImposter")}
        className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        {Array.from({ length: playerCount }, (_, index) => (
          <VoteCard
            key={index}
            index={index}
            selected={selectedVote === index}
            onSelect={selectVote}
            label={t("playerN", { n: index + 1 })}
            selectedLabel={t("selected")}
            delay={Math.min(index, 12) * 0.03}
          />
        ))}
      </div>

      <BottomBar width="wide">
        <p className="min-h-5 text-center text-sm text-muted" aria-live="polite">
          {selectedVote !== null ? t("votedFor", { player: t("playerN", { n: selectedVote + 1 }) }) : ""}
        </p>
        <Button
          size="lg"
          fullWidth
          variant="imposter"
          disabled={selectedVote === null}
          onClick={revealResult}
          className="sm:mx-auto sm:max-w-md"
        >
          {t("revealResult")}
        </Button>
      </BottomBar>
    </Screen>
  );
}
