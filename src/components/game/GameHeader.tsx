"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { IconButton } from "@/components/ui/IconButton";
import { HomeIcon } from "@/components/ui/icons";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";

type GameHeaderProps = {
  /** Centre content (e.g. progress label). */
  children?: ReactNode;
  right?: ReactNode;
  className?: string;
  /** Skip the confirmation (e.g. on the result screen where nothing is lost). */
  confirmExit?: boolean;
};

/** Top bar used during a round: exit-with-confirmation, centre slot, right slot. */
export function GameHeader({ children, right, className, confirmExit = true }: GameHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const requestExit = useGameStore((s) => s.requestExit);
  const [open, setOpen] = useState(false);

  // Flag the exit and navigate; the home screen clears the round on mount,
  // so this screen never flashes back to setup while the navigation runs.
  const exit = () => {
    requestExit();
    router.push("/");
  };

  return (
    <>
      <header className={cn("flex h-14 items-center justify-between gap-2", className)}>
        <div className="flex w-12 justify-start">
          <IconButton label={t("exitToHome")} onClick={() => (confirmExit ? setOpen(true) : exit())}>
            <HomeIcon />
          </IconButton>
        </div>
        <div className="min-w-0 flex-1 text-center">{children}</div>
        <div className="flex w-12 justify-end">{right}</div>
      </header>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("leaveRoundTitle")}
        description={t("leaveRoundBody")}
        closeLabel={t("close")}
        actions={
          <>
            <Button variant="imposter" fullWidth onClick={exit}>
              {t("leave")}
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)} data-autofocus>
              {t("stay")}
            </Button>
          </>
        }
      />
    </>
  );
}
