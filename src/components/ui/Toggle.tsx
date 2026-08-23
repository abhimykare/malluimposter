"use client";

import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
  /** Visible "On"/"Off" text next to the switch. */
  stateLabels?: { on: string; off: string };
  disabled?: boolean;
  className?: string;
};

/**
 * An accessible switch rendered as a full-width row so the whole row is a
 * comfortable touch target. Uses role="switch" + aria-checked.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  stateLabels,
  disabled,
  className,
}: ToggleProps) {
  const id = useId();
  const descId = description ? `${id}-desc` : undefined;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={descId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "group flex w-full min-h-14 items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
        "surface-card hover:bg-surface-2 disabled:opacity-50",
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md transition-colors",
            checked ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted",
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span id={`${id}-label`} className="block font-semibold text-fg">
          {label}
        </span>
        {description && (
          <span id={descId} className="mt-0.5 block text-sm text-muted text-pretty">
            {description}
          </span>
        )}
      </span>
      {stateLabels && (
        <span
          aria-hidden
          className={cn(
            "eyebrow tabular",
            checked ? "text-accent" : "text-faint",
          )}
        >
          {checked ? stateLabels.on : stateLabels.off}
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-accent" : "bg-surface-3 ring-1 ring-inset ring-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
