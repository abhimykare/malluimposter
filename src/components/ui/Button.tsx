"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "imposter" | "word" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-md font-semibold " +
  "select-none whitespace-nowrap transition-[transform,background-color,box-shadow,color,opacity,filter] " +
  "duration-150 ease-out active:scale-[0.975] disabled:pointer-events-none disabled:opacity-45 " +
  "motion-reduce:transition-none motion-reduce:active:scale-100";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "text-on-accent shadow-glow-accent " +
    "bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] " +
    "hover:brightness-105 active:brightness-95",
  secondary:
    "bg-surface-2 text-fg border border-border-strong shadow-sm hover:bg-surface-3",
  outline:
    "bg-transparent text-fg border border-border-strong hover:bg-surface-2",
  ghost: "bg-transparent text-muted hover:text-fg hover:bg-surface-2",
  imposter:
    "text-on-imposter shadow-glow-imposter " +
    "bg-[linear-gradient(135deg,var(--imposter),var(--imposter-strong))] hover:brightness-105",
  word:
    "text-on-word shadow-glow-word " +
    "bg-[linear-gradient(135deg,var(--word),var(--word-strong))] hover:brightness-105",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

function classes({ variant = "primary", size = "md", fullWidth, className }: CommonProps) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

export function Button({
  variant,
  size,
  fullWidth,
  loading,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}

export type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
    prefetch?: boolean;
  };

/** A Next.js Link styled as a button. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  href,
  prefetch,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={classes({ variant, size, fullWidth, className })}
      {...rest}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
