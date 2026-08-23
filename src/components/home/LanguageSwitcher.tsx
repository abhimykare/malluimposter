"use client";

import { LANGUAGE_LABELS } from "@/data/translations";
import type { Language } from "@/data/types";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";

const OPTIONS: ReadonlyArray<{ value: Language; label: string; ariaLabel: string }> = [
  { value: "ml", label: LANGUAGE_LABELS.ml, ariaLabel: "Malayalam — മലയാളം" },
  { value: "en", label: LANGUAGE_LABELS.en, ariaLabel: "English" },
];

/**
 * Language picker. The *visual* selected state is driven by CSS from
 * `<html lang>` (set before paint and kept in sync by the store), so the
 * server-rendered markup already looks right before hydration; React supplies
 * the behaviour and ARIA state.
 */
export function LanguageSwitcher({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { t, language } = useTranslation();
  const setLanguage = useGameStore((s) => s.setLanguage);
  return (
    <div
      role="radiogroup"
      aria-label={t("language")}
      className={cn(
        "inline-flex w-full items-center gap-1 rounded-md bg-surface-2 p-1 ring-1 ring-inset ring-border",
        className,
      )}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={language === option.value}
          aria-label={option.ariaLabel}
          data-lang-option={option.value}
          onClick={() => setLanguage(option.value)}
          className={cn(
            "lang-option relative flex-1 rounded-sm font-semibold text-muted transition-[background-color,color,box-shadow,transform] duration-150 ease-out hover:text-fg active:scale-[0.97] motion-reduce:transition-none",
            size === "md" ? "min-h-11 px-3 text-sm sm:text-[0.95rem]" : "min-h-10 px-3 text-sm",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
