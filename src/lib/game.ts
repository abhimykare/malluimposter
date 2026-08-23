import type { CategoryId, Language, WordEntry } from "@/data/types";
import { pickRandom, randomInt } from "./random";

/**
 * Pure, UI-independent game logic. Everything here is deterministic given its
 * inputs except for the explicit random picks, which makes it easy to test.
 */

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const DEFAULT_PLAYERS = 5;

export const TIMER_OPTIONS_MINUTES = [1, 2, 3, 5] as const;
export type TimerMinutes = (typeof TIMER_OPTIONS_MINUTES)[number];
export const DEFAULT_TIMER_MINUTES: TimerMinutes = 2;

/** How many recent word ids we remember to avoid immediate repeats. */
export const RECENT_WORDS_LIMIT = 12;

export type GamePhase = "setup" | "revealing" | "starter" | "discussion" | "voting" | "result";

export type PlayerRole = "player" | "imposter";

export type Player = {
  /** Zero-based seat index; displayed as "Player {index + 1}". */
  index: number;
  role: PlayerRole;
};

export type GameSettings = {
  playerCount: number;
  language: Language;
  /** Empty array means "all categories". */
  selectedCategories: CategoryId[];
  imposterClueEnabled: boolean;
  timerEnabled: boolean;
  /** Timer duration in minutes. */
  timerDuration: TimerMinutes;
};

export type GameOutcome = "group" | "imposter";

export type RoundResult = {
  outcome: GameOutcome;
  imposterIndex: number;
  votedIndex: number;
};

export function clampPlayerCount(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_PLAYERS;
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(value)));
}

export function isValidPlayerCount(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_PLAYERS && value <= MAX_PLAYERS;
}

export function isTimerMinutes(value: unknown): value is TimerMinutes {
  return (
    typeof value === "number" &&
    (TIMER_OPTIONS_MINUTES as readonly number[]).includes(value)
  );
}

/**
 * Filters the word pool by the selected categories. An empty selection means
 * "all categories". Words are already language-specific, so the caller must
 * pass the pool for the active language only.
 */
export function filterWordsByCategories(
  words: readonly WordEntry[],
  selectedCategories: readonly CategoryId[],
): WordEntry[] {
  if (selectedCategories.length === 0) return words.slice();
  const allowed = new Set<CategoryId>(selectedCategories);
  return words.filter((w) => allowed.has(w.category));
}

/**
 * Picks a random secret word, avoiding recently used ids when possible.
 * If every eligible word was used recently, the whole pool is eligible again.
 */
export function pickSecretWord(
  pool: readonly WordEntry[],
  recentIds: readonly string[] = [],
): WordEntry {
  if (pool.length === 0) {
    throw new Error("pickSecretWord: the word pool is empty");
  }
  const recent = new Set(recentIds);
  const fresh = pool.filter((w) => !recent.has(w.id));
  return pickRandom(fresh.length > 0 ? fresh : pool);
}

/** Picks a random imposter seat index in [0, playerCount). */
export function pickImposterIndex(playerCount: number): number {
  if (!isValidPlayerCount(playerCount)) {
    throw new RangeError(`pickImposterIndex: invalid player count ${playerCount}`);
  }
  return randomInt(playerCount);
}

/**
 * Picks who opens the discussion. Every seat is eligible when the imposter
 * has a clue to work with; without a clue the imposter is excluded so the
 * opener always has something to say.
 */
export function pickStarterIndex(
  playerCount: number,
  imposterIndex: number,
  imposterEligible: boolean,
): number {
  if (!isValidPlayerCount(playerCount)) {
    throw new RangeError(`pickStarterIndex: invalid player count ${playerCount}`);
  }
  const candidates: number[] = [];
  for (let i = 0; i < playerCount; i++) {
    if (imposterEligible || i !== imposterIndex) candidates.push(i);
  }
  return pickRandom(candidates);
}

/** Builds the seat list, marking exactly one imposter. */
export function createPlayers(playerCount: number, imposterIndex: number): Player[] {
  if (!isValidPlayerCount(playerCount)) {
    throw new RangeError(`createPlayers: invalid player count ${playerCount}`);
  }
  if (imposterIndex < 0 || imposterIndex >= playerCount) {
    throw new RangeError(`createPlayers: imposter index ${imposterIndex} out of range`);
  }
  return Array.from({ length: playerCount }, (_, index) => ({
    index,
    role: index === imposterIndex ? "imposter" : "player",
  }));
}

/** The group wins only if the vote lands on the imposter. */
export function resolveRound(votedIndex: number, imposterIndex: number): RoundResult {
  return {
    outcome: votedIndex === imposterIndex ? "group" : "imposter",
    imposterIndex,
    votedIndex,
  };
}

/** Appends an id to the recent list, keeping only the newest `limit` ids. */
export function pushRecentWord(
  recentIds: readonly string[],
  id: string,
  limit: number = RECENT_WORDS_LIMIT,
): string[] {
  const next = recentIds.filter((r) => r !== id);
  next.push(id);
  return next.slice(Math.max(0, next.length - limit));
}

/**
 * Formats seconds as mm:ss (e.g. 125 → "02:05").
 */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
