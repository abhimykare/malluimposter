"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { ArrowLeftIcon } from "./icons";
import { IconButton } from "./IconButton";

type ScreenHeaderProps = {
  title?: ReactNode;
  /** Accessible label for the back control. */
  backLabel: string;
  /** Where back goes. Defaults to router.back(). */
  onBack?: () => void;
  backHref?: string;
  right?: ReactNode;
  className?: string;
  /** Hide the back button but keep the layout. */
  hideBack?: boolean;
};

/** Compact top bar: back control, optional centred title, optional right slot. */
export function ScreenHeader({
  title,
  backLabel,
  onBack,
  backHref,
  right,
  className,
  hideBack,
}: ScreenHeaderProps) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
    router.back();
  };
  return (
    <header className={cn("mb-2 flex h-14 items-center justify-between gap-2", className)}>
      <div className="flex w-12 justify-start">
        {!hideBack && (
          <IconButton label={backLabel} onClick={handleBack}>
            <ArrowLeftIcon />
          </IconButton>
        )}
      </div>
      {title ? (
        <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold text-fg">{title}</h1>
      ) : (
        <div className="flex-1" />
      )}
      <div className="flex w-12 justify-end">{right}</div>
    </header>
  );
}
