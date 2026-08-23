"use client";

import { useCallback } from "react";

import { translate, type TranslationKey, type TranslationParams } from "@/data/translations";
import type { Language } from "@/data/types";
import { selectLanguage, useGameStore } from "@/store/game-store";

export type TFunction = (key: TranslationKey, params?: TranslationParams) => string;

/** Returns the active UI language from the store. */
export function useLanguage(): Language {
  return useGameStore(selectLanguage);
}

/** Returns a memoised translation function bound to the active language. */
export function useTranslation(): { t: TFunction; language: Language } {
  const language = useLanguage();
  const t = useCallback<TFunction>(
    (key, params) => translate(language, key, params),
    [language],
  );
  return { t, language };
}
