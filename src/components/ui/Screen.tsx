import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ScreenProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Content max width: narrow for focused game moments, wide for setup. */
  width?: "narrow" | "default" | "wide";
  /** Adds bottom padding to clear a sticky CTA bar ("tall" = two rows). */
  withBottomBar?: boolean | "tall";
  /** Vertically centre the content (used for dramatic moments). */
  center?: boolean;
};

const WIDTHS = {
  narrow: "max-w-md",
  default: "max-w-lg",
  wide: "max-w-2xl lg:max-w-4xl",
};

/**
 * Full-height page container with safe-area padding and a restrained max
 * width so desktop never stretches the game board across the screen.
 */
export function Screen({
  children,
  className,
  width = "default",
  withBottomBar,
  center,
  ...rest
}: ScreenProps) {
  return (
    <main
      className={cn(
        "bg-ambient relative flex min-h-dvh w-full flex-col",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "safe-px mx-auto flex w-full flex-1 flex-col safe-pt",
          WIDTHS[width],
          withBottomBar === "tall" ? "pb-safe-cta-tall" : withBottomBar ? "pb-safe-cta" : "safe-pb",
          center && "justify-center",
        )}
      >
        {children}
      </div>
    </main>
  );
}

type BottomBarProps = {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "default" | "wide";
};

/** Fixed bottom action bar with safe-area padding — the thumb zone. */
export function BottomBar({ children, className, width = "default" }: BottomBarProps) {
  return (
    <div className="bottom-bar pointer-events-none fixed inset-x-0 bottom-0 z-30 pt-6">
      <div
        className={cn(
          "safe-px pointer-events-auto mx-auto flex w-full flex-col gap-3",
          WIDTHS[width],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
