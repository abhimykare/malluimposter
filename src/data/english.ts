import type { WordEntry } from "./types";
import { EN_ANIMALS } from "./words/en-animals";
import { EN_CLOTHING } from "./words/en-clothing";
import { EN_ENTERTAINMENT } from "./words/en-entertainment";
import { EN_FOOD } from "./words/en-food";
import { EN_HOUSEHOLD } from "./words/en-household";
import { EN_NATURE } from "./words/en-nature";
import { EN_PLACES } from "./words/en-places";
import { EN_PROFESSIONS } from "./words/en-professions";
import { EN_SPORTS } from "./words/en-sports";
import { EN_TECHNOLOGY } from "./words/en-technology";
import { EN_VEHICLES } from "./words/en-vehicles";

/** All English words. Never mixed with Malayalam at runtime. */
export const ENGLISH_WORDS: readonly WordEntry[] = [
  ...EN_FOOD,
  ...EN_ANIMALS,
  ...EN_HOUSEHOLD,
  ...EN_PLACES,
  ...EN_NATURE,
  ...EN_TECHNOLOGY,
  ...EN_VEHICLES,
  ...EN_SPORTS,
  ...EN_PROFESSIONS,
  ...EN_CLOTHING,
  ...EN_ENTERTAINMENT,
];
