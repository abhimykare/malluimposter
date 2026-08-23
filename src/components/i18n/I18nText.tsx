import { interpolate, type TranslationKey, type TranslationParams, translations } from "@/data/translations";

/**
 * Server-renderable bilingual text. Both languages are emitted and CSS shows
 * only the one matching `<html lang>` — which an inline script sets before
 * first paint from the persisted preference. This lets static screens (home,
 * rules) paint instantly in the right language with zero client JavaScript,
 * and switch instantly when the language changes.
 *
 * Use `t()` (client) for attributes such as aria-labels, and this component
 * for visible copy on static screens.
 */
export function I18nText({ k, params }: { k: TranslationKey; params?: TranslationParams }) {
  return (
    <>
      <span lang="en" data-i18n="en">
        {interpolate(translations.en[k], params)}
      </span>
      <span lang="ml" data-i18n="ml">
        {interpolate(translations.ml[k], params)}
      </span>
    </>
  );
}
