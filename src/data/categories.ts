import type { Category, CategoryId, Language } from "./types";

const ALL: readonly Language[] = ["ml", "en"];
const EN_ONLY: readonly Language[] = ["en"];

/**
 * Category configuration. Names are provided in both languages so the same
 * category id can be shown in either UI language.
 *
 * `languages` declares which languages have words for the category. It is kept
 * static (rather than derived from the datasets) so that the settings store
 * and the home screen never need to load the word lists; a test asserts the
 * declaration matches the data. When you add Malayalam words for a new
 * category, add "ml" here.
 */
export const CATEGORIES: readonly Category[] = [
  {
    id: "food",
    name: { en: "Food & Drinks", ml: "ഭക്ഷണവും രുചികളും" },
    emoji: "🍛",
    hue: 28,
    languages: ALL,
  },
  {
    id: "animals",
    name: { en: "Animals", ml: "മൃഗങ്ങളും ജീവികളും" },
    emoji: "🐘",
    hue: 140,
    languages: ALL,
  },
  {
    id: "household",
    name: { en: "Household", ml: "വീട്ടുസാധനങ്ങൾ" },
    emoji: "🪔",
    hue: 40,
    languages: ALL,
  },
  {
    id: "places",
    name: { en: "Places", ml: "സ്ഥലങ്ങൾ" },
    emoji: "🏝️",
    hue: 200,
    languages: EN_ONLY,
  },
  {
    id: "nature",
    name: { en: "Nature", ml: "പ്രകൃതി" },
    emoji: "🌧️",
    hue: 160,
    languages: EN_ONLY,
  },
  {
    id: "technology",
    name: { en: "Technology", ml: "സാങ്കേതികവിദ്യ" },
    emoji: "💻",
    hue: 220,
    languages: EN_ONLY,
  },
  {
    id: "vehicles",
    name: { en: "Vehicles", ml: "വാഹനങ്ങൾ" },
    emoji: "🛺",
    hue: 0,
    languages: EN_ONLY,
  },
  {
    id: "sports",
    name: { en: "Sports", ml: "കായികം" },
    emoji: "🏏",
    hue: 100,
    languages: EN_ONLY,
  },
  {
    id: "professions",
    name: { en: "Professions", ml: "തൊഴിലുകൾ" },
    emoji: "🩺",
    hue: 260,
    languages: EN_ONLY,
  },
  {
    id: "clothing",
    name: { en: "Clothing & Accessories", ml: "വസ്ത്രങ്ങളും അലങ്കാരങ്ങളും" },
    emoji: "👗",
    hue: 320,
    languages: EN_ONLY,
  },
  {
    id: "entertainment",
    name: { en: "Entertainment", ml: "വിനോദം" },
    emoji: "🎬",
    hue: 290,
    languages: EN_ONLY,
  },
] as const;

export const CATEGORY_IDS: readonly CategoryId[] = CATEGORIES.map((c) => c.id);

const CATEGORY_MAP: ReadonlyMap<CategoryId, Category> = new Map(
  CATEGORIES.map((c) => [c.id, c]),
);

export function getCategory(id: CategoryId): Category {
  const category = CATEGORY_MAP.get(id);
  if (!category) {
    throw new Error(`Unknown category: ${id}`);
  }
  return category;
}

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === "string" && CATEGORY_MAP.has(value as CategoryId);
}

export function getCategoryName(id: CategoryId, language: Language): string {
  return getCategory(id).name[language];
}

/**
 * Categories available for a language, in canonical display order. Static so
 * it can be used without loading the word datasets.
 */
export function getAvailableCategories(language: Language): readonly Category[] {
  return CATEGORIES.filter((c) => c.languages.includes(language));
}

export function getAvailableCategoryIds(language: Language): CategoryId[] {
  return getAvailableCategories(language).map((c) => c.id);
}
