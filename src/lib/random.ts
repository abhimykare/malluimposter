/**
 * Small, dependency-free randomness helpers built on the Web Crypto API.
 * Falls back to Math.random() only when crypto is unavailable (very old
 * browsers / unusual test environments) so the game never hard-fails.
 */

function getCrypto(): Crypto | undefined {
  const maybe = (globalThis as { crypto?: Crypto }).crypto;
  if (maybe && typeof maybe.getRandomValues === "function") {
    return maybe;
  }
  return undefined;
}

/**
 * Returns a uniformly distributed integer in the range [0, maxExclusive).
 * Uses rejection sampling to avoid modulo bias.
 */
export function randomInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError(`randomInt: maxExclusive must be a positive integer, got ${maxExclusive}`);
  }
  if (maxExclusive === 1) return 0;

  const cryptoObj = getCrypto();
  if (!cryptoObj) {
    return Math.floor(Math.random() * maxExclusive);
  }

  const range = 0x1_0000_0000; // 2^32
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  // Rejection sampling: loop until the value is inside the unbiased range.
  // Expected iterations < 2.
  for (;;) {
    cryptoObj.getRandomValues(buffer);
    const value = buffer[0];
    if (value < limit) {
      return value % maxExclusive;
    }
  }
}

/** Picks a uniformly random element from a non-empty array. */
export function pickRandom<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new RangeError("pickRandom: cannot pick from an empty array");
  }
  return items[randomInt(items.length)];
}

/** Returns a new array with the items shuffled (Fisher–Yates). */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generates a short random id (URL-safe), e.g. for keys. */
export function randomId(length = 8): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[randomInt(alphabet.length)];
  }
  return out;
}
