import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/data/categories";
import { ENGLISH_WORDS } from "@/data/english";
import { getAvailableCategories, getCategoryCounts, getWords } from "@/data";
import { MALAYALAM_WORDS } from "@/data/malayalam";
import type { WordEntry } from "@/data/types";
import { validateDataset } from "@/lib/validation";

const MALAYALAM_RE = /^[ഀ-ൿ‌‍\s.,'’-]+$/u;
const LATIN_RE = /^[A-Za-z0-9 .,'’&-]+$/u;

function errorsOf(words: readonly WordEntry[], language: "ml" | "en") {
  return validateDataset(words, language).filter((i) => i.level === "error");
}

describe("datasets", () => {
  it("Malayalam dataset is valid", () => {
    const errors = errorsOf(MALAYALAM_WORDS, "ml");
    expect(errors, errors.map((e) => `${e.id}: ${e.message}`).join("\n")).toEqual([]);
    expect(MALAYALAM_WORDS.length).toBeGreaterThanOrEqual(150);
  });

  it("English dataset is valid", () => {
    const errors = errorsOf(ENGLISH_WORDS, "en");
    expect(errors, errors.map((e) => `${e.id}: ${e.message}`).join("\n")).toEqual([]);
    expect(ENGLISH_WORDS.length).toBeGreaterThanOrEqual(250);
  });

  it("Malayalam words and clues use Malayalam script only", () => {
    const bad = MALAYALAM_WORDS.filter((w) => !MALAYALAM_RE.test(w.word) || !MALAYALAM_RE.test(w.clue));
    expect(bad.map((w) => `${w.id}: ${w.word} → ${w.clue}`)).toEqual([]);
  });

  it("English words and clues use Latin script only", () => {
    const bad = ENGLISH_WORDS.filter((w) => !LATIN_RE.test(w.word) || !LATIN_RE.test(w.clue));
    expect(bad.map((w) => `${w.id}: ${w.word} → ${w.clue}`)).toEqual([]);
  });

  it("clues are short (≤ 3 words) and never equal the word", () => {
    for (const w of [...MALAYALAM_WORDS, ...ENGLISH_WORDS]) {
      expect(w.clue.trim().split(/\s+/).length, `${w.id} clue too long`).toBeLessThanOrEqual(3);
      expect(w.clue.trim().toLowerCase(), w.id).not.toBe(w.word.trim().toLowerCase());
    }
  });

  it("the same clue is not overused within a category", () => {
    for (const words of [MALAYALAM_WORDS, ENGLISH_WORDS]) {
      const byCat = new Map<string, Map<string, number>>();
      for (const w of words) {
        const m = byCat.get(w.category) ?? new Map<string, number>();
        const key = w.clue.trim().toLowerCase();
        m.set(key, (m.get(key) ?? 0) + 1);
        byCat.set(w.category, m);
      }
      for (const [cat, m] of byCat) {
        for (const [clue, n] of m) {
          expect(n, `clue "${clue}" used ${n}× in ${cat}`).toBeLessThanOrEqual(4);
        }
      }
    }
  });

  it("the Malayalam dataset contains the required seed words", () => {
    const words = new Set(MALAYALAM_WORDS.map((w) => w.word));
    for (const w of ["ചോറ്", "കട്ടിൽ", "ആന", "മയിൽ", "തേങ്ങ", "കുട", "പായസം", "പഴുതാര", "പേന"]) {
      expect(words.has(w), `missing ${w}`).toBe(true);
    }
  });

  it("the English dataset contains the required seed words", () => {
    const words = new Set(ENGLISH_WORDS.map((w) => w.word.toLowerCase()));
    for (const w of ["Pizza", "Elephant", "Bed", "Beach", "Rainbow", "Laptop", "Helicopter", "Cricket", "Pilot", "Saree", "Guitar"]) {
      expect(words.has(w.toLowerCase()), `missing ${w}`).toBe(true);
    }
  });

  it("every category id used in data exists in the config", () => {
    const ids = new Set(CATEGORIES.map((c) => c.id));
    for (const w of [...MALAYALAM_WORDS, ...ENGLISH_WORDS]) expect(ids.has(w.category), w.id).toBe(true);
  });

  it("available categories and counts are consistent", () => {
    for (const language of ["ml", "en"] as const) {
      const counts = getCategoryCounts(language);
      const available = getAvailableCategories(language);
      const total = [...counts.values()].reduce((a, b) => a + b, 0);
      expect(total).toBe(getWords(language).length);
      for (const c of available) expect(counts.get(c.id) ?? 0).toBeGreaterThan(0);
    }
    expect(getAvailableCategories("ml").map((c) => c.id)).toEqual(["food", "animals", "household"]);
    expect(getAvailableCategories("en").length).toBe(CATEGORIES.length);
  });

  it("the static `languages` declaration on each category matches the datasets", () => {
    for (const language of ["ml", "en"] as const) {
      const counts = getCategoryCounts(language);
      for (const category of CATEGORIES) {
        const hasWords = (counts.get(category.id) ?? 0) > 0;
        expect(category.languages.includes(language), `${category.id} / ${language}`).toBe(hasWords);
      }
    }
  });
});
