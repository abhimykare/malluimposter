import { describe, expect, it } from "vitest";

import { pickRandom, randomId, randomInt, shuffle } from "@/lib/random";

describe("randomInt", () => {
  it("returns integers within [0, max)", () => {
    for (let i = 0; i < 2000; i++) {
      const v = randomInt(7);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });

  it("covers every value in a small range", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(randomInt(5));
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it("is roughly uniform", () => {
    const buckets = new Array(4).fill(0);
    const n = 20000;
    for (let i = 0; i < n; i++) buckets[randomInt(4)]++;
    for (const b of buckets) {
      expect(b / n).toBeGreaterThan(0.2);
      expect(b / n).toBeLessThan(0.3);
    }
  });

  it("rejects invalid input", () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(-3)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });
});

describe("pickRandom / shuffle / randomId", () => {
  it("picks an element from the array", () => {
    const items = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) expect(items).toContain(pickRandom(items));
    expect(() => pickRandom([])).toThrow();
  });

  it("shuffle keeps the same multiset and does not mutate", () => {
    const items = [1, 2, 3, 4, 5, 6];
    const out = shuffle(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(items);
  });

  it("randomId has the requested length", () => {
    expect(randomId(10)).toHaveLength(10);
  });
});
