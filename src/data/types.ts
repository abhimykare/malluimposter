/**
 * Core data types shared by the datasets, the game engine and the UI.
 *
 * The dataset is fully static and bilingual: every word entry belongs to
 * exactly one language and one category. Malayalam words are never translated
 * into English (and vice versa) — each language has its own curated list.
 */

export type Language = "ml" | "en";

export const LANGUAGES: readonly Language[] = ["ml", "en"] as const;

export type CategoryId =
  | "food"
  | "animals"
  | "household"
  | "places"
  | "nature"
  | "technology"
  | "vehicles"
  | "sports"
  | "professions"
  | "clothing"
  | "entertainment";

/**
 * How much the clue helps the imposter.
 *  - easy:   fairly strong association (rarely used)
 *  - medium: low-information association (default)
 *  - hard:   very indirect association
 */
export type ClueDifficulty = "easy" | "medium" | "hard";

export type WordEntry = {
  /** Stable unique id, e.g. "en-food-pizza" or "ml-household-kattil". */
  id: string;
  /** The secret word, in the language of the dataset it lives in. */
  word: string;
  category: CategoryId;
  /** A short, indirect, low-information clue shown only to the imposter. */
  clue: string;
  difficulty: ClueDifficulty;
};

export type LocalizedText = Record<Language, string>;

export type Category = {
  id: CategoryId;
  name: LocalizedText;
  /** Emoji used as a lightweight, dependency-free icon. */
  emoji: string;
  /** Accent hue (0–360) used to tint the category card. */
  hue: number;
  /** Languages that have words for this category. */
  languages: readonly Language[];
};
