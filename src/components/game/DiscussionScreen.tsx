"use client";

import { m } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckIcon, ChatIcon, VoteIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameStore } from "@/store/game-store";

import { GameHeader } from "./GameHeader";
import { Timer } from "./Timer";

const item = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.34, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function DiscussionScreen() {
  const { t } = useTranslation();
  const round = useGameStore((s) => s.round);
  const roundId = useGameStore((s) => s.roundId);
  const startVoting = useGameStore((s) => s.startVoting);

  return (
    <Screen width="narrow" withBottomBar>
      <GameHeader>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
          <CheckIcon size={16} strokeWidth={3} />
          {t("everyoneReady")}
        </span>
      </GameHeader>

      <div className="flex flex-1 flex-col justify-center gap-5 py-4">
        <m.div custom={0} variants={item} initial="hidden" animate="show" className="text-center">
          <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <ChatIcon size={30} />
          </span>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
            {t("discussionTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-[28ch] text-lg text-muted text-balance">{t("discussionBody")}</p>
        </m.div>

        {round?.timerEnabled && (
          <m.div custom={1} variants={item} initial="hidden" animate="show">
            <Timer key={roundId} minutes={round.timerDuration} />
          </m.div>
        )}

        <m.div custom={2} variants={item} initial="hidden" animate="show">
          <Card className="flex items-center gap-3 bg-surface-2/60 py-3">
            <span aria-hidden className="text-xl">🤫</span>
            <p className="text-sm font-medium text-muted text-pretty">{t("discussionTip")}</p>
          </Card>
        </m.div>
      </div>

      <BottomBar width="narrow">
        <Button size="lg" fullWidth onClick={startVoting} leadingIcon={<VoteIcon size={20} />}>
          {t("startVoting")}
        </Button>
      </BottomBar>
    </Screen>
  );
}
