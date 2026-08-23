import type { WordEntry } from "./types";
import { ML_ANIMALS } from "./words/ml-animals";
import { ML_FOOD } from "./words/ml-food";
import { ML_HOUSEHOLD } from "./words/ml-household";

/** All Malayalam words. Never mixed with English at runtime. */
export const MALAYALAM_WORDS: readonly WordEntry[] = [
  ...ML_FOOD,
  ...ML_ANIMALS,
  ...ML_HOUSEHOLD,
];
