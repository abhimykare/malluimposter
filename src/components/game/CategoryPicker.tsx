"use client";

import { useMemo } from "react";

import { CheckIcon } from "@/components/ui/icons";
import { getAvailableCategories, getCategoryCounts } from "@/data";
import type { Category, CategoryId } from "@/data/types";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/cn";
import { useGameStore } from "@/store/game-store";

type CategoryCardProps = {
  category: Category;
  selected: boolean;
  count: number;
  onToggle: (id: CategoryId) => void;
  language: "ml" | "en";
  wordsLabel: string;
};

function CategoryCard({ category, selected, count, onToggle, language, wordsLabel }: CategoryCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onToggle(category.id)}
      className={cn(
        "group relative flex min-h-[7rem] flex-col items-start justify-between gap-2 rounded-lg p-3 text-left transition-[background-color,box-shadow,transform,border-color] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none",
        selected ? "bg-accent-soft ring-2 ring-inset ring-accent shadow-sm" : "surface-card hover:bg-surface-2",
      )}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md text-[1.35rem]"
          style={{ background: `hsl(${category.hue} 70% 55% / ${selected ? 0.24 : 0.12})` }}
        >
          {category.emoji}
        </span>
        <span
          aria-hidden
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full transition-[background-color,color] duration-150",
            selected ? "bg-accent text-on-accent" : "bg-surface-2 text-transparent ring-1 ring-inset ring-border-strong",
          )}
        >
          <CheckIcon size={14} strokeWidth={3} />
        </span>
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-fg">{category.name[language]}</span>
        <span className="mt-0.5 block text-xs font-medium text-muted tabular">{wordsLabel}</span>
      </span>
      <span className="sr-only">{count}</span>
    </button>
  );
}

export function CategoryPicker({ className }: { className?: string }) {
  const { t, language } = useTranslation();
  const selected = useGameStore((s) => s.settings.selectedCategories[s.settings.language]);
  const toggleCategory = useGameStore((s) => s.toggleCategory);
  const selectAll = useGameStore((s) => s.selectAllCategories);

  const categories = useMemo(() => getAvailableCategories(language), [language]);
  const counts = useMemo(() => getCategoryCounts(language), [language]);
  const allSelected = selected.length === categories.length;

  return (
    <div className={cn("flex flex-col gap-2.5", className)} role="group" aria-label={t("categoryPicker")}>
      <button
        type="button"
        aria-pressed={allSelected}
        onClick={selectAll}
        className={cn(
          "flex min-h-12 items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left font-semibold transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.99] motion-reduce:transition-none",
          allSelected ? "bg-accent-soft ring-2 ring-inset ring-accent text-fg" : "surface-card text-fg hover:bg-surface-2",
        )}
      >
        <span className="flex items-center gap-2.5">
          <span aria-hidden className="text-xl">✨</span>
          {t("allCategories")}
        </span>
        <span className={cn("text-xs font-semibold tabular", allSelected ? "text-accent" : "text-muted")}>
          {t("categoriesSelectedCount", { count: selected.length })}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            selected={selected.includes(category.id)}
            count={counts.get(category.id) ?? 0}
            onToggle={toggleCategory}
            language={language}
            wordsLabel={t("wordsAvailable", { count: counts.get(category.id) ?? 0 })}
          />
        ))}
      </div>
    </div>
  );
}
