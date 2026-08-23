import { ENGLISH_WORDS } from "./english";
import { MALAYALAM_WORDS } from "./malayalam";
import type { CategoryId, Language, WordEntry } from "./types";

export type { Category, CategoryId, Language, WordEntry } from "./types";
export {
  CATEGORIES,
  getAvailableCategories,
  getAvailableCategoryIds,
  getCategory,
  getCategoryName,
  isCategoryId,
} from "./categories";

/**
 * Word datasets. This module is intentionally only imported where words are
 * actually needed (the setup screen and the round builder) so the home screen
 * bundle stays tiny. Import category metadata from `./categories` instead.
 */

const WORDS_BY_LANGUAGE: Record<Language, readonly WordEntry[]> = {
  ml: MALAYALAM_WORDS,
  en: ENGLISH_WORDS,
};

/** The complete word pool for a language. */
export function getWords(language: Language): readonly WordEntry[] {
  return WORDS_BY_LANGUAGE[language];
}

const COUNTS_CACHE = new Map<Language, ReadonlyMap<CategoryId, number>>();

/** Word count per category for a language (cached). */
export function getCategoryCounts(language: Language): ReadonlyMap<CategoryId, number> {
  const cached = COUNTS_CACHE.get(language);
  if (cached) return cached;
  const counts = new Map<CategoryId, number>();
  for (const word of WORDS_BY_LANGUAGE[language]) {
    counts.set(word.category, (counts.get(word.category) ?? 0) + 1);
  }
  COUNTS_CACHE.set(language, counts);
  return counts;
}
