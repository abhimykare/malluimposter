import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getAvailableCategoryIds, isCategoryId } from "@/data/categories";
import type { CategoryId, Language, WordEntry } from "@/data/types";
import {
  clampPlayerCount,
  createPlayers,
  DEFAULT_PLAYERS,
  DEFAULT_TIMER_MINUTES,
  filterWordsByCategories,
  type GamePhase,
  type GameSettings,
  isTimerMinutes,
  type Player,
  pickImposterIndex,
  pickSecretWord,
  pushRecentWord,
  resolveRound,
  type RoundResult,
  type TimerMinutes,
} from "@/lib/game";
import { safeStorage, STORAGE_KEY } from "@/lib/storage";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ThemePreference = "dark" | "light" | "system";

/**
 * Settings persisted across sessions. Categories are remembered per language
 * because the two languages expose different category sets.
 */
export type PersistedSettings = Omit<GameSettings, "selectedCategories"> & {
  selectedCategories: Record<Language, CategoryId[]>;
};

export type StartGameResult =
  | { ok: true }
  | { ok: false; reason: "no-categories" | "no-words" | "invalid-players" | "load-failed" };

/** Settings snapshot frozen for the active round. */
export type RoundConfig = {
  language: Language;
  playerCount: number;
  imposterClueEnabled: boolean;
  timerEnabled: boolean;
  timerDuration: TimerMinutes;
};

type RoundState = {
  phase: GamePhase;
  /** Monotonic id per round; useful for resetting timers/animations. */
  roundId: number;
  round: RoundConfig | null;
  players: Player[];
  secretWord: WordEntry | null;
  imposterIndex: number | null;
  /** Seat currently holding the phone during the reveal phase. */
  currentPlayerIndex: number;
  selectedVote: number | null;
  result: RoundResult | null;
  /**
   * Set when the player chose "exit to home" mid-round. The round is kept in
   * memory until the home screen mounts and clears it, so the game screen
   * never flashes the setup view while the navigation is in flight.
   */
  exitRequested: boolean;
};

type PersistedState = {
  settings: PersistedSettings;
  theme: ThemePreference;
  recentWordIds: string[];
};

type Actions = {
  // settings
  setLanguage: (language: Language) => void;
  setPlayerCount: (count: number) => void;
  incrementPlayers: () => void;
  decrementPlayers: () => void;
  toggleCategory: (id: CategoryId) => void;
  selectAllCategories: () => void;
  setImposterClueEnabled: (enabled: boolean) => void;
  setTimerEnabled: (enabled: boolean) => void;
  setTimerDuration: (minutes: TimerMinutes) => void;
  setTheme: (theme: ThemePreference) => void;

  // round lifecycle (async: the word datasets are loaded on demand)
  startGame: () => Promise<StartGameResult>;
  advanceReveal: () => void;
  startVoting: () => void;
  selectVote: (index: number | null) => void;
  revealResult: () => void;
  playAgain: () => Promise<StartGameResult>;
  backToSetup: () => void;
  resetRound: () => void;
  requestExit: () => void;

  // hydration
  _hasHydrated: boolean;
  _setHasHydrated: (value: boolean) => void;
};

export type GameStore = PersistedState & RoundState & Actions;

/* -------------------------------------------------------------------------- */
/*  Defaults & sanitisation                                                   */
/* -------------------------------------------------------------------------- */

export const STORE_VERSION = 1;

export function defaultSettings(): PersistedSettings {
  return {
    playerCount: DEFAULT_PLAYERS,
    language: "en",
    selectedCategories: {
      en: getAvailableCategoryIds("en"),
      ml: getAvailableCategoryIds("ml"),
    },
    imposterClueEnabled: true,
    timerEnabled: false,
    timerDuration: DEFAULT_TIMER_MINUTES,
  };
}

const EMPTY_ROUND: RoundState = {
  phase: "setup",
  roundId: 0,
  round: null,
  players: [],
  secretWord: null,
  imposterIndex: null,
  currentPlayerIndex: 0,
  selectedVote: null,
  result: null,
  exitRequested: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLanguage(value: unknown): value is Language {
  return value === "ml" || value === "en";
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

function sanitizeCategoryList(value: unknown, language: Language): CategoryId[] {
  const available = new Set(getAvailableCategoryIds(language));
  if (!Array.isArray(value)) return [...available];
  const cleaned: CategoryId[] = [];
  for (const item of value) {
    if (isCategoryId(item) && available.has(item) && !cleaned.includes(item)) {
      cleaned.push(item);
    }
  }
  return cleaned;
}

/**
 * Turns whatever was in localStorage into a valid persisted state. Anything
 * missing or malformed falls back to defaults, field by field, so a corrupted
 * entry never breaks the app.
 */
export function sanitizePersistedState(input: unknown): PersistedState {
  const defaults = defaultSettings();
  const raw = isRecord(input) ? input : {};
  const rawSettings = isRecord(raw.settings) ? raw.settings : {};
  const rawCategories = isRecord(rawSettings.selectedCategories)
    ? rawSettings.selectedCategories
    : {};

  const settings: PersistedSettings = {
    playerCount:
      typeof rawSettings.playerCount === "number"
        ? clampPlayerCount(rawSettings.playerCount)
        : defaults.playerCount,
    language: isLanguage(rawSettings.language) ? rawSettings.language : defaults.language,
    selectedCategories: {
      en: isRecord(rawSettings.selectedCategories)
        ? sanitizeCategoryList(rawCategories.en, "en")
        : defaults.selectedCategories.en,
      ml: isRecord(rawSettings.selectedCategories)
        ? sanitizeCategoryList(rawCategories.ml, "ml")
        : defaults.selectedCategories.ml,
    },
    imposterClueEnabled:
      typeof rawSettings.imposterClueEnabled === "boolean"
        ? rawSettings.imposterClueEnabled
        : defaults.imposterClueEnabled,
    timerEnabled:
      typeof rawSettings.timerEnabled === "boolean"
        ? rawSettings.timerEnabled
        : defaults.timerEnabled,
    timerDuration: isTimerMinutes(rawSettings.timerDuration)
      ? rawSettings.timerDuration
      : defaults.timerDuration,
  };

  const recentWordIds = Array.isArray(raw.recentWordIds)
    ? raw.recentWordIds.filter((id): id is string => typeof id === "string").slice(-24)
    : [];

  return {
    settings,
    theme: isTheme(raw.theme) ? raw.theme : "dark",
    recentWordIds,
  };
}

/* -------------------------------------------------------------------------- */
/*  Store                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Loads the word datasets lazily. They are only needed once a round starts,
 * which keeps the home screen bundle free of ~600 words.
 */
async function loadWords(language: Language): Promise<readonly WordEntry[]> {
  const mod = await import("@/data");
  return mod.getWords(language);
}

type BuildResult =
  | { ok: true; round: RoundState }
  | { ok: false; reason: Exclude<StartGameResult, { ok: true }>["reason"] };

async function buildRound(
  settings: PersistedSettings,
  recentWordIds: string[],
  roundId: number,
): Promise<BuildResult> {
  const language = settings.language;
  const available = new Set(getAvailableCategoryIds(language));
  const selected = settings.selectedCategories[language].filter((c) => available.has(c));
  if (selected.length === 0) return { ok: false, reason: "no-categories" };

  const playerCount = clampPlayerCount(settings.playerCount);
  if (playerCount !== settings.playerCount) return { ok: false, reason: "invalid-players" };

  let words: readonly WordEntry[];
  try {
    words = await loadWords(language);
  } catch {
    return { ok: false, reason: "load-failed" };
  }

  const pool = filterWordsByCategories(words, selected);
  if (pool.length === 0) return { ok: false, reason: "no-words" };

  const secretWord = pickSecretWord(pool, recentWordIds);
  const imposterIndex = pickImposterIndex(playerCount);
  const players = createPlayers(playerCount, imposterIndex);

  return {
    ok: true,
    round: {
      phase: "revealing",
      roundId,
      round: {
        language,
        playerCount,
        imposterClueEnabled: settings.imposterClueEnabled,
        timerEnabled: settings.timerEnabled,
        timerDuration: settings.timerDuration,
      },
      players,
      secretWord,
      imposterIndex,
      currentPlayerIndex: 0,
      selectedVote: null,
      result: null,
      exitRequested: false,
    },
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...sanitizePersistedState(undefined),
      ...EMPTY_ROUND,
      _hasHydrated: false,
      _setHasHydrated: (value) => set({ _hasHydrated: value }),

      /* ----------------------------- settings ----------------------------- */
      setLanguage: (language) =>
        set((s) => ({ settings: { ...s.settings, language } })),
      setPlayerCount: (count) =>
        set((s) => ({ settings: { ...s.settings, playerCount: clampPlayerCount(count) } })),
      incrementPlayers: () =>
        set((s) => ({
          settings: { ...s.settings, playerCount: clampPlayerCount(s.settings.playerCount + 1) },
        })),
      decrementPlayers: () =>
        set((s) => ({
          settings: { ...s.settings, playerCount: clampPlayerCount(s.settings.playerCount - 1) },
        })),
      toggleCategory: (id) =>
        set((s) => {
          const language = s.settings.language;
          const current = s.settings.selectedCategories[language];
          const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
          return {
            settings: {
              ...s.settings,
              selectedCategories: { ...s.settings.selectedCategories, [language]: next },
            },
          };
        }),
      selectAllCategories: () =>
        set((s) => {
          const language = s.settings.language;
          return {
            settings: {
              ...s.settings,
              selectedCategories: {
                ...s.settings.selectedCategories,
                [language]: getAvailableCategoryIds(language),
              },
            },
          };
        }),
      setImposterClueEnabled: (imposterClueEnabled) =>
        set((s) => ({ settings: { ...s.settings, imposterClueEnabled } })),
      setTimerEnabled: (timerEnabled) =>
        set((s) => ({ settings: { ...s.settings, timerEnabled } })),
      setTimerDuration: (timerDuration) =>
        set((s) => ({ settings: { ...s.settings, timerDuration } })),
      setTheme: (theme) => set({ theme }),

      /* ------------------------------ round ------------------------------- */
      startGame: async () => {
        const s = get();
        const built = await buildRound(s.settings, s.recentWordIds, s.roundId + 1);
        if (!built.ok) return { ok: false, reason: built.reason };
        // Guard against a stale start (e.g. settings changed while loading).
        if (get().phase !== "setup") return { ok: true };
        set(built.round);
        return { ok: true };
      },

      advanceReveal: () =>
        set((s) => {
          if (s.phase !== "revealing" || !s.round) return {};
          const next = s.currentPlayerIndex + 1;
          if (next >= s.round.playerCount) {
            return { phase: "discussion", currentPlayerIndex: s.round.playerCount };
          }
          return { currentPlayerIndex: next };
        }),

      startVoting: () =>
        set((s) => (s.phase === "discussion" ? { phase: "voting", selectedVote: null } : {})),

      selectVote: (index) =>
        set((s) => {
          if (s.phase !== "voting" || !s.round) return {};
          if (index !== null && (index < 0 || index >= s.round.playerCount)) return {};
          return { selectedVote: index };
        }),

      revealResult: () =>
        set((s) => {
          if (s.phase !== "voting" || s.selectedVote === null || s.imposterIndex === null) return {};
          const result = resolveRound(s.selectedVote, s.imposterIndex);
          const recentWordIds = s.secretWord
            ? pushRecentWord(s.recentWordIds, s.secretWord.id)
            : s.recentWordIds;
          return { phase: "result", result, recentWordIds };
        }),

      playAgain: async () => {
        const s = get();
        const built = await buildRound(s.settings, s.recentWordIds, s.roundId + 1);
        // If the user left the result screen while we were loading, do nothing.
        if (get().phase !== "result" || get().roundId !== s.roundId) return { ok: true };
        if (!built.ok) {
          set({ ...EMPTY_ROUND, roundId: s.roundId });
          return { ok: false, reason: built.reason };
        }
        set(built.round);
        return { ok: true };
      },

      backToSetup: () => set((s) => ({ ...EMPTY_ROUND, roundId: s.roundId })),
      resetRound: () => set((s) => ({ ...EMPTY_ROUND, roundId: s.roundId })),
      requestExit: () => set({ exitRequested: true }),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => safeStorage),
      // Only preferences are persisted. Secrets stay in memory.
      partialize: (state) => ({
        settings: state.settings,
        theme: state.theme,
        recentWordIds: state.recentWordIds,
      }),
      // Hydrate manually on the client to avoid SSR markup mismatches.
      skipHydration: true,
      migrate: (persisted) => sanitizePersistedState(persisted),
      merge: (persisted, current) => ({
        ...current,
        ...sanitizePersistedState(persisted),
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error && process.env.NODE_ENV !== "production") {
          console.warn("[store] Failed to rehydrate; using defaults.", error);
        }
        // Always mark hydration as finished — even when storage was corrupt
        // (state is undefined then) — so gated screens never stay blank.
        if (state) state._setHasHydrated(true);
        else useGameStore.setState({ _hasHydrated: true });
      },
    },
  ),
);

/* -------------------------------------------------------------------------- */
/*  Selectors                                                                 */
/* -------------------------------------------------------------------------- */

export type RevealCard =
  | { kind: "word"; word: string }
  | { kind: "imposter"; clue: string | null };

/**
 * What the player currently holding the phone is allowed to see. The secret
 * word is only ever returned for non-imposter seats, so the imposter UI can
 * never render it by accident.
 */
export function selectCurrentReveal(state: GameStore): RevealCard | null {
  const { phase, players, currentPlayerIndex, secretWord, round } = state;
  if (phase !== "revealing" || !secretWord || !round) return null;
  const player = players[currentPlayerIndex];
  if (!player) return null;
  if (player.role === "imposter") {
    return { kind: "imposter", clue: round.imposterClueEnabled ? secretWord.clue : null };
  }
  return { kind: "word", word: secretWord.word };
}

export const selectLanguage = (s: GameStore): Language => s.settings.language;
export const selectPhase = (s: GameStore): GamePhase => s.phase;
export const selectHasHydrated = (s: GameStore): boolean => s._hasHydrated;
