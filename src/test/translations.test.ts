import { describe, expect, it } from "vitest";

import { interpolate, LANGUAGE_LABELS, translate, translations } from "@/data/translations";

describe("translations", () => {
  it("has every key in both languages, non-empty", () => {
    const enKeys = Object.keys(translations.en).sort();
    const mlKeys = Object.keys(translations.ml).sort();
    expect(mlKeys).toEqual(enKeys);
    for (const key of enKeys) {
      const k = key as keyof typeof translations.en;
      expect(translations.en[k].trim(), `en.${key}`).not.toBe("");
      expect(translations.ml[k].trim(), `ml.${key}`).not.toBe("");
    }
  });

  it("Malayalam UI strings contain Malayalam script (except brand/numeric-only strings)", () => {
    for (const [key, value] of Object.entries(translations.ml)) {
      if (key === "appName") continue;
      // Strings that are only placeholders/punctuation (e.g. "{current} / {total}") are language-neutral.
      const withoutPlaceholders = value.replace(/\{\w+\}/g, "");
      if (!/\p{L}/u.test(withoutPlaceholders)) continue;
      expect(/[ഀ-ൿ]/u.test(value), `ml.${key} = ${value}`).toBe(true);
      // And must not contain Latin words (brand name aside).
      expect(/[A-Za-z]{3,}/.test(withoutPlaceholders), `ml.${key} contains Latin text: ${value}`).toBe(false);
    }
  });

  it("placeholders match between languages", () => {
    for (const [key, value] of Object.entries(translations.en)) {
      const enPh = [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      const mlPh = [...translations.ml[key as keyof typeof translations.ml].matchAll(/\{(\w+)\}/g)]
        .map((m) => m[1])
        .sort();
      expect(mlPh, `placeholders for ${key}`).toEqual(enPh);
    }
  });

  it("interpolates params and leaves unknown placeholders visible", () => {
    expect(interpolate("Player {n}", { n: 3 })).toBe("Player 3");
    expect(interpolate("{a} and {b}", { a: "x" })).toBe("x and {b}");
    expect(translate("ml", "playerN", { n: 2 })).toBe("പ്ലെയർ 2");
    expect(translate("en", "revealProgress", { current: 1, total: 5 })).toBe("1 of 5");
  });

  it("exposes native-script language labels", () => {
    expect(LANGUAGE_LABELS.ml).toBe("മലയാളം");
    expect(LANGUAGE_LABELS.en).toBe("English");
  });
});
