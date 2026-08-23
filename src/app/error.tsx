"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameStore } from "@/store/game-store";

/**
 * Route-level error boundary. Offers a retry and a clean way home. Resets the
 * in-memory round so a corrupt game state cannot trap the user.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();
  const resetRound = useGameStore((s) => s.resetRound);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <main className="bg-ambient flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo size={64} />
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-fg">{t("errorTitle")}</h1>
      <p className="mt-2 max-w-[32ch] text-muted text-balance">{t("errorBody")}</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        <Button
          onClick={() => {
            resetRound();
            reset();
          }}
        >
          {t("retry")}
        </Button>
        <Link
          href="/"
          onClick={() => resetRound()}
          className="inline-flex h-12 items-center justify-center rounded-md bg-surface-2 font-semibold text-fg ring-1 ring-inset ring-border-strong"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
