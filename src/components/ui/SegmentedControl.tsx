"use client";

import { cn } from "@/lib/cn";

export type SegmentOption<T extends string | number> = {
  value: T;
  label: string;
  ariaLabel?: string;
};

type SegmentedControlProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentOption<T>[];
  label: string;
  size?: "sm" | "md";
  className?: string;
  /** Give each segment equal width. */
  grow?: boolean;
};

/**
 * Radio-group style segmented control. Uses CSS transitions only (no motion
 * library) so it stays cheap; the selected pill animates with a background
 * transition per segment.
 */
export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
  grow = true,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex w-full items-center gap-1 rounded-md bg-surface-2 p-1 ring-1 ring-inset ring-border",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none",
              size === "md" ? "min-h-11 px-2.5 py-1.5 text-sm leading-tight sm:text-[0.95rem]" : "min-h-10 px-2.5 py-1 text-sm leading-tight",
              grow && "flex-1",
              selected
                ? "bg-surface text-fg shadow-sm ring-1 ring-inset ring-border-strong"
                : "text-muted hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
