// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";

import { STORAGE_KEY } from "@/lib/storage";
import {
  defaultSettings,
  sanitizePersistedState,
  selectCurrentReveal,
  STORE_VERSION,
  useGameStore,
} from "@/store/game-store";

function fresh() {
  useGameStore.setState({
    ...sanitizePersistedState(undefined),
    phase: "setup",
    roundId: 0,
    round: null,
    players: [],
    secretWord: null,
    imposterIndex: null,
    currentPlayerIndex: 0,
    selectedVote: null,
    result: null,
  });
}

describe("sanitizePersistedState", () => {
  it("falls back to defaults for garbage input", () => {
    for (const input of [undefined, null, 42, "nope", [], { settings: "x" }, { settings: { playerCount: "9" } }]) {
      const state = sanitizePersistedState(input);
      expect(state.settings).toEqual(defaultSettings());
      expect(state.theme).toBe("dark");
      expect(state.recentWordIds).toEqual([]);
    }
  });

  it("keeps valid values and repairs invalid ones field by field", () => {
    const state = sanitizePersistedState({
      settings: {
        playerCount: 99,
        language: "ml",
        selectedCategories: { en: ["food", "bogus", "food"], ml: ["places"] },
        imposterClueEnabled: false,
        timerEnabled: true,
        timerDuration: 7,
      },
      theme: "light",
      recentWordIds: ["a", 3, null, "b"],
    });
    expect(state.settings.playerCount).toBe(20);
    expect(state.settings.language).toBe("ml");
    expect(state.settings.selectedCategories.en).toEqual(["food"]);
    // "places" has no Malayalam words, so it is dropped.
    expect(state.settings.selectedCategories.ml).toEqual([]);
    expect(state.settings.imposterClueEnabled).toBe(false);
    expect(state.settings.timerEnabled).toBe(true);
    expect(state.settings.timerDuration).toBe(2);
    expect(state.theme).toBe("light");
    expect(state.recentWordIds).toEqual(["a", "b"]);
  });
});

describe("game store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fresh();
  });

  it("starts a round with one imposter and a word from the selected categories", async () => {
    useGameStore.getState().setLanguage("ml");
    useGameStore.getState().setPlayerCount(6);
    useGameStore.getState().selectAllCategories();
    useGameStore.getState().toggleCategory("food");
    useGameStore.getState().toggleCategory("animals");
    const result = await useGameStore.getState().startGame();
    expect(result.ok).toBe(true);
    const s = useGameStore.getState();
    expect(s.phase).toBe("revealing");
    expect(s.players).toHaveLength(6);
    expect(s.players.filter((p) => p.role === "imposter")).toHaveLength(1);
    expect(s.secretWord?.category).toBe("household");
    expect(s.secretWord?.id.startsWith("ml-")).toBe(true);
    expect(s.round?.language).toBe("ml");
  });

  it("refuses to start with no categories", async () => {
    useGameStore.getState().setLanguage("en");
    useGameStore.setState((s) => ({
      settings: { ...s.settings, selectedCategories: { ...s.settings.selectedCategories, en: [] } },
    }));
    const result = await useGameStore.getState().startGame();
    expect(result).toEqual({ ok: false, reason: "no-categories" });
    expect(useGameStore.getState().phase).toBe("setup");
  });

  it("never exposes the secret word to the imposter seat", async () => {
    useGameStore.getState().setPlayerCount(4);
    expect((await useGameStore.getState().startGame()).ok).toBe(true);
    const s = useGameStore.getState();
    const imposterIndex = s.imposterIndex!;
    for (let seat = 0; seat < 4; seat++) {
      useGameStore.setState({ currentPlayerIndex: seat });
      const card = selectCurrentReveal(useGameStore.getState());
      expect(card).not.toBeNull();
      if (seat === imposterIndex) {
        expect(card!.kind).toBe("imposter");
        expect(JSON.stringify(card)).not.toContain(s.secretWord!.word);
        if (card!.kind === "imposter") expect(card!.clue).toBe(s.secretWord!.clue);
      } else {
        expect(card).toEqual({ kind: "word", word: s.secretWord!.word });
      }
    }
  });

  it("hides the clue when clue mode is off", async () => {
    useGameStore.getState().setImposterClueEnabled(false);
    useGameStore.getState().setPlayerCount(3);
    expect((await useGameStore.getState().startGame()).ok).toBe(true);
    useGameStore.setState({ currentPlayerIndex: useGameStore.getState().imposterIndex! });
    const card = selectCurrentReveal(useGameStore.getState());
    expect(card).toEqual({ kind: "imposter", clue: null });
  });

  it("walks through reveal → discussion → voting → result", async () => {
    useGameStore.getState().setPlayerCount(3);
    expect((await useGameStore.getState().startGame()).ok).toBe(true);
    const api = useGameStore.getState();
    api.advanceReveal();
    api.advanceReveal();
    expect(useGameStore.getState().phase).toBe("revealing");
    api.advanceReveal();
    expect(useGameStore.getState().phase).toBe("starter");
    expect(useGameStore.getState().starterIndex).not.toBeNull();
    api.startVoting(); // not allowed yet
    expect(useGameStore.getState().phase).toBe("starter");
    api.beginDiscussion();
    expect(useGameStore.getState().phase).toBe("discussion");
    api.startVoting();
    expect(useGameStore.getState().phase).toBe("voting");
    // Cannot reveal without a vote
    api.revealResult();
    expect(useGameStore.getState().phase).toBe("voting");
    const imposter = useGameStore.getState().imposterIndex!;
    api.selectVote(imposter);
    api.revealResult();
    const s = useGameStore.getState();
    expect(s.phase).toBe("result");
    expect(s.result?.outcome).toBe("group");
    expect(s.recentWordIds).toContain(s.secretWord!.id);
  });

  it("imposter wins on a wrong vote", async () => {
    useGameStore.getState().setPlayerCount(3);
    await useGameStore.getState().startGame();
    const api = useGameStore.getState();
    api.advanceReveal();
    api.advanceReveal();
    api.advanceReveal();
    api.beginDiscussion();
    api.startVoting();
    const wrong = (useGameStore.getState().imposterIndex! + 1) % 3;
    api.selectVote(wrong);
    api.revealResult();
    expect(useGameStore.getState().result?.outcome).toBe("imposter");
  });

  it("ignores out-of-range votes and out-of-phase actions", async () => {
    useGameStore.getState().setPlayerCount(3);
    await useGameStore.getState().startGame();
    useGameStore.getState().selectVote(1); // not voting yet
    expect(useGameStore.getState().selectedVote).toBeNull();
    useGameStore.getState().startVoting(); // not in discussion
    expect(useGameStore.getState().phase).toBe("revealing");
    useGameStore.setState({ phase: "voting" });
    useGameStore.getState().selectVote(10);
    expect(useGameStore.getState().selectedVote).toBeNull();
  });

  it("playAgain starts a new round with the same settings and avoids the last word", async () => {
    useGameStore.getState().setLanguage("en");
    useGameStore.getState().setPlayerCount(4);
    await useGameStore.getState().startGame();
    const first = useGameStore.getState().secretWord!.id;
    useGameStore.setState({ phase: "result", recentWordIds: [first] });
    const r = await useGameStore.getState().playAgain();
    expect(r.ok).toBe(true);
    const s = useGameStore.getState();
    expect(s.phase).toBe("revealing");
    expect(s.roundId).toBe(2);
    expect(s.secretWord!.id).not.toBe(first);
    expect(s.currentPlayerIndex).toBe(0);
    expect(s.selectedVote).toBeNull();
  });

  it("backToSetup clears secrets", async () => {
    await useGameStore.getState().startGame();
    useGameStore.getState().backToSetup();
    const s = useGameStore.getState();
    expect(s.phase).toBe("setup");
    expect(s.secretWord).toBeNull();
    expect(s.players).toEqual([]);
    expect(s.imposterIndex).toBeNull();
  });

  it("toggling categories is scoped to the active language", () => {
    useGameStore.getState().setLanguage("en");
    useGameStore.getState().toggleCategory("food");
    expect(useGameStore.getState().settings.selectedCategories.en).not.toContain("food");
    expect(useGameStore.getState().settings.selectedCategories.ml).toContain("food");
  });
});

describe("persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fresh();
  });

  it("persists only preferences, never round secrets", async () => {
    useGameStore.getState().setLanguage("ml");
    useGameStore.getState().setPlayerCount(8);
    useGameStore.getState().setTheme("light");
    await useGameStore.getState().startGame();
    // Give the persist middleware a tick
    await new Promise((r) => setTimeout(r, 0));
    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(STORE_VERSION);
    expect(parsed.state.settings.language).toBe("ml");
    expect(parsed.state.settings.playerCount).toBe(8);
    expect(parsed.state.theme).toBe("light");
    expect(parsed.state.secretWord).toBeUndefined();
    expect(parsed.state.players).toBeUndefined();
    expect(parsed.state.imposterIndex).toBeUndefined();
    expect(parsed.state.phase).toBeUndefined();
    const secret = useGameStore.getState().secretWord!.word;
    expect(raw).not.toContain(secret);
  });

  it("rehydrates valid state and repairs corrupt state", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          settings: { playerCount: 12, language: "ml", timerDuration: 99 },
          theme: "purple",
          recentWordIds: "nope",
        },
        version: STORE_VERSION,
      }),
    );
    await useGameStore.persist.rehydrate();
    const s = useGameStore.getState();
    expect(s.settings.playerCount).toBe(12);
    expect(s.settings.language).toBe("ml");
    expect(s.settings.timerDuration).toBe(2);
    expect(s.theme).toBe("dark");
    expect(s.recentWordIds).toEqual([]);
    expect(s._hasHydrated).toBe(true);
    // Round state untouched by hydration
    expect(s.phase).toBe("setup");
  });

  it("survives completely broken JSON", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    await expect(useGameStore.persist.rehydrate()).resolves.not.toThrow();
    expect(useGameStore.getState().settings.playerCount).toBe(defaultSettings().playerCount);
  });
});

describe("player names", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fresh();
  });

  it("stores trimmed, capped names and keeps the array compact", () => {
    useGameStore.getState().setPlayerName(2, "  Anu   Mol  ");
    expect(useGameStore.getState().settings.playerNames).toEqual(["", "", "Anu Mol"]);
    useGameStore.getState().setPlayerName(0, "x".repeat(60));
    expect(useGameStore.getState().settings.playerNames[0]).toHaveLength(24);
    useGameStore.getState().setPlayerName(2, "");
    expect(useGameStore.getState().settings.playerNames).toEqual(["x".repeat(24)]);
    useGameStore.getState().clearPlayerNames();
    expect(useGameStore.getState().settings.playerNames).toEqual([]);
  });

  it("freezes names into the round and keeps the imposter random", async () => {
    useGameStore.getState().setPlayerCount(4);
    useGameStore.getState().setPlayerName(1, "Kichu");
    const seen = new Set<number>();
    for (let i = 0; i < 60; i++) {
      expect((await useGameStore.getState().startGame()).ok).toBe(true);
      const s = useGameStore.getState();
      expect(s.round?.playerNames).toEqual(["", "Kichu", "", ""]);
      seen.add(s.imposterIndex!);
      useGameStore.getState().backToSetup();
    }
    // Over 60 rounds every seat should have been the imposter at least once.
    expect(seen.size).toBe(4);
  });

  it("sanitises persisted names", () => {
    const state = sanitizePersistedState({ settings: { playerNames: ["Ammu", 5, null, " Bob "] } });
    expect(state.settings.playerNames).toEqual(["Ammu", "", "", "Bob"]);
  });
});

describe("starter pick", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fresh();
  });

  async function runRound(clue: boolean) {
    useGameStore.getState().setImposterClueEnabled(clue);
    useGameStore.getState().setPlayerCount(3);
    expect((await useGameStore.getState().startGame()).ok).toBe(true);
    const api = useGameStore.getState();
    api.advanceReveal();
    api.advanceReveal();
    api.advanceReveal();
    const s = useGameStore.getState();
    return { starter: s.starterIndex!, imposter: s.imposterIndex! };
  }

  it("never picks the imposter to start when the clue is off", async () => {
    for (let i = 0; i < 80; i++) {
      const { starter, imposter } = await runRound(false);
      expect(starter).not.toBe(imposter);
      expect(starter).toBeGreaterThanOrEqual(0);
      expect(starter).toBeLessThan(3);
      useGameStore.getState().backToSetup();
    }
  });

  it("can pick the imposter to start when the clue is on", async () => {
    let imposterStarted = false;
    for (let i = 0; i < 120 && !imposterStarted; i++) {
      const { starter, imposter } = await runRound(true);
      if (starter === imposter) imposterStarted = true;
      useGameStore.getState().backToSetup();
    }
    expect(imposterStarted).toBe(true);
  });

  it("resets the starter for a new round", async () => {
    await runRound(true);
    useGameStore.setState({ phase: "result" });
    await useGameStore.getState().playAgain();
    expect(useGameStore.getState().starterIndex).toBeNull();
    expect(useGameStore.getState().phase).toBe("revealing");
  });
});
