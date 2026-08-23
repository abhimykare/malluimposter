"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Accessible name — required because the button has no visible text. */
  label: string;
  children: ReactNode;
  variant?: "ghost" | "surface" | "primary";
  size?: "md" | "lg";
};

/** A square, touch-friendly icon-only button (≥44px). */
export function IconButton({
  label,
  children,
  className,
  variant = "ghost",
  size = "md",
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md transition-[background-color,color,transform] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none",
        size === "md" ? "size-11" : "size-12",
        variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-fg",
        variant === "surface" && "bg-surface-2 text-fg border border-border-strong hover:bg-surface-3",
        variant === "primary" &&
          "text-on-accent bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
