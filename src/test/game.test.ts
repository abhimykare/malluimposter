import { describe, expect, it } from "vitest";

import type { WordEntry } from "@/data/types";
import {
  clampPlayerCount,
  createPlayers,
  filterWordsByCategories,
  formatClock,
  isValidPlayerCount,
  MAX_PLAYERS,
  MIN_PLAYERS,
  pickImposterIndex,
  pickSecretWord,
  pickStarterIndex,
  pushRecentWord,
  resolveRound,
} from "@/lib/game";

const words: WordEntry[] = [
  { id: "en-food-pizza", word: "Pizza", category: "food", clue: "Oven", difficulty: "medium" },
  { id: "en-food-tea", word: "Tea", category: "food", clue: "Morning", difficulty: "medium" },
  { id: "en-animals-lion", word: "Lion", category: "animals", clue: "Safari", difficulty: "medium" },
  { id: "en-places-beach", word: "Beach", category: "places", clue: "Sand", difficulty: "medium" },
];

describe("player count", () => {
  it("clamps to the allowed range", () => {
    expect(clampPlayerCount(0)).toBe(MIN_PLAYERS);
    expect(clampPlayerCount(999)).toBe(MAX_PLAYERS);
    expect(clampPlayerCount(7.4)).toBe(7);
    expect(clampPlayerCount(Number.NaN)).toBeGreaterThanOrEqual(MIN_PLAYERS);
  });
  it("validates integers in range", () => {
    expect(isValidPlayerCount(3)).toBe(true);
    expect(isValidPlayerCount(20)).toBe(true);
    expect(isValidPlayerCount(2)).toBe(false);
    expect(isValidPlayerCount(21)).toBe(false);
    expect(isValidPlayerCount(4.5)).toBe(false);
  });
});

describe("category filtering", () => {
  it("returns everything for an empty selection", () => {
    expect(filterWordsByCategories(words, [])).toHaveLength(4);
  });
  it("filters to the selected categories only", () => {
    const out = filterWordsByCategories(words, ["food", "places"]);
    expect(out.map((w) => w.id).sort()).toEqual(["en-food-pizza", "en-food-tea", "en-places-beach"]);
  });
  it("returns an empty list when nothing matches", () => {
    expect(filterWordsByCategories(words, ["sports"])).toEqual([]);
  });
});

describe("word selection", () => {
  it("picks from the pool", () => {
    for (let i = 0; i < 30; i++) expect(words).toContain(pickSecretWord(words));
  });
  it("avoids recently used words when possible", () => {
    const recent = ["en-food-pizza", "en-food-tea", "en-animals-lion"];
    for (let i = 0; i < 30; i++) expect(pickSecretWord(words, recent).id).toBe("en-places-beach");
  });
  it("falls back to the full pool when everything is recent", () => {
    const recent = words.map((w) => w.id);
    expect(words).toContain(pickSecretWord(words, recent));
  });
  it("throws on an empty pool", () => {
    expect(() => pickSecretWord([])).toThrow();
  });
});

describe("imposter selection & players", () => {
  it("picks an index inside the seat range and eventually every seat", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 400; i++) {
      const idx = pickImposterIndex(5);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
      seen.add(idx);
    }
    expect(seen.size).toBe(5);
  });
  it("creates exactly one imposter", () => {
    const players = createPlayers(6, 2);
    expect(players).toHaveLength(6);
    expect(players.filter((p) => p.role === "imposter")).toEqual([{ index: 2, role: "imposter" }]);
  });
  it("rejects bad input", () => {
    expect(() => createPlayers(2, 0)).toThrow();
    expect(() => createPlayers(4, 4)).toThrow();
    expect(() => pickImposterIndex(25)).toThrow();
  });
});

describe("round result", () => {
  it("group wins when the vote hits the imposter", () => {
    expect(resolveRound(3, 3).outcome).toBe("group");
  });
  it("imposter wins otherwise", () => {
    expect(resolveRound(1, 3).outcome).toBe("imposter");
  });
});

describe("recent words", () => {
  it("appends, dedupes and trims", () => {
    let recent: string[] = [];
    for (let i = 0; i < 15; i++) recent = pushRecentWord(recent, `w${i}`, 12);
    expect(recent).toHaveLength(12);
    expect(recent[0]).toBe("w3");
    recent = pushRecentWord(recent, "w5", 12);
    expect(recent.filter((r) => r === "w5")).toHaveLength(1);
    expect(recent.at(-1)).toBe("w5");
  });
});

describe("formatClock", () => {
  it("formats mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(125)).toBe("02:05");
    expect(formatClock(3600)).toBe("60:00");
    expect(formatClock(-4)).toBe("00:00");
  });
});

describe("starter selection", () => {
  it("excludes the imposter when they have no clue", () => {
    for (let i = 0; i < 200; i++) expect(pickStarterIndex(5, 2, false)).not.toBe(2);
  });
  it("includes every seat (incl. imposter) when the clue is enabled", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 400; i++) seen.add(pickStarterIndex(4, 1, true));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });
  it("rejects bad input", () => {
    expect(() => pickStarterIndex(2, 0, true)).toThrow();
  });
});
