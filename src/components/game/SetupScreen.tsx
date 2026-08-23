"use client";

import { m } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { LanguageSwitcher } from "@/components/home/LanguageSwitcher";
import { ThemeToggle } from "@/components/home/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Card";
import { LightbulbIcon, PlayIcon, TimerIcon } from "@/components/ui/icons";
import { BottomBar, Screen } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { getCategoryCounts } from "@/data";
import { useTranslation } from "@/hooks/useTranslation";
import { TIMER_OPTIONS_MINUTES, type TimerMinutes } from "@/lib/game";
import { useGameStore, type StartGameResult } from "@/store/game-store";

import { CategoryPicker } from "./CategoryPicker";
import { PlayerCounter } from "./PlayerCounter";
import { PlayerNames } from "./PlayerNames";

export function SetupScreen() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const selected = useGameStore((s) => s.settings.selectedCategories[s.settings.language]);
  const imposterClueEnabled = useGameStore((s) => s.settings.imposterClueEnabled);
  const timerEnabled = useGameStore((s) => s.settings.timerEnabled);
  const timerDuration = useGameStore((s) => s.settings.timerDuration);
  const setImposterClueEnabled = useGameStore((s) => s.setImposterClueEnabled);
  const setTimerEnabled = useGameStore((s) => s.setTimerEnabled);
  const setTimerDuration = useGameStore((s) => s.setTimerDuration);
  const startGame = useGameStore((s) => s.startGame);

  const [error, setError] = useState<Exclude<StartGameResult, { ok: true }>["reason"] | null>(null);
  const [starting, setStarting] = useState(false);

  const wordCount = useMemo(() => {
    const counts = getCategoryCounts(language);
    return selected.reduce((sum, id) => sum + (counts.get(id) ?? 0), 0);
  }, [language, selected]);

  const noCategories = selected.length === 0;

  const onStart = async () => {
    setStarting(true);
    try {
      const result = await startGame();
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      setError(null);
    } finally {
      setStarting(false);
    }
  };

  const errorMessage =
    noCategories || error === "no-categories"
      ? t("selectAtLeastOneCategory")
      : error === "no-words"
        ? t("noWordsForSelection")
        : error === "load-failed"
          ? t("errorBody")
          : null;

  const timerOptions = TIMER_OPTIONS_MINUTES.map((n) => ({
    value: n,
    label: t("minutesShort", { n }),
    ariaLabel: t("minutesLong", { n }),
  }));

  return (
    <Screen width="wide" withBottomBar>
      <ScreenHeader backLabel={t("home")} onBack={() => router.push("/")} right={<ThemeToggle />} />

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-1"
      >
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          {t("setupTitle")}
        </h1>
        <p className="mt-1.5 text-muted text-pretty">{t("setupSubtitle")}</p>
      </m.div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="flex flex-col gap-7">
          <section>
            <SectionLabel>{t("language")}</SectionLabel>
            <LanguageSwitcher />
          </section>

          <section>
            <SectionLabel hint={t("playersHint")}>{t("players")}</SectionLabel>
            <PlayerCounter />
          </section>

          <section>
            <SectionLabel>{t("playerNames")}</SectionLabel>
            <PlayerNames />
          </section>

          <section className="flex flex-col gap-2.5">
            <SectionLabel>{t("settings")}</SectionLabel>
            <Toggle
              checked={imposterClueEnabled}
              onChange={setImposterClueEnabled}
              label={t("imposterClue")}
              description={t("imposterClueHint")}
              icon={<LightbulbIcon size={20} />}
              stateLabels={{ on: t("on"), off: t("off") }}
            />
            <Toggle
              checked={timerEnabled}
              onChange={setTimerEnabled}
              label={t("discussionTimer")}
              description={t("discussionTimerHint")}
              icon={<TimerIcon size={20} />}
              stateLabels={{ on: t("on"), off: t("off") }}
            />
            {timerEnabled && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <SegmentedControl<TimerMinutes>
                  value={timerDuration}
                  onChange={setTimerDuration}
                  options={timerOptions}
                  label={t("discussionTimer")}
                  className="mt-0.5"
                />
              </m.div>
            )}
          </section>
        </div>

        <section>
          <SectionLabel hint={t("wordsAvailable", { count: wordCount })}>{t("categories")}</SectionLabel>
          <p className="mb-3 px-1 text-sm text-muted text-pretty">{t("categoriesHint")}</p>
          <CategoryPicker />
        </section>
      </div>

      <BottomBar width="wide">
        {errorMessage && (
          <p role="alert" className="rounded-md bg-imposter-soft px-3 py-2 text-center text-sm font-semibold text-imposter">
            {errorMessage}
          </p>
        )}
        <Button
          size="lg"
          fullWidth
          onClick={() => void onStart()}
          disabled={noCategories}
          loading={starting}
          leadingIcon={<PlayIcon size={20} />}
          className="sm:mx-auto sm:max-w-md"
        >
          {t("startRound")}
        </Button>
      </BottomBar>
    </Screen>
  );
}
