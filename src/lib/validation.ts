import { isCategoryId } from "@/data/categories";
import type { Language, WordEntry } from "@/data/types";

/**
 * Development-time dataset validation. Runs in tests (and can be invoked in
 * dev) to guarantee the static data is complete and safe to ship.
 */

export type ValidationIssue = {
  level: "error" | "warning";
  message: string;
  id?: string;
};

const DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const ID_PATTERN = /^(ml|en)-[a-z]+-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function validateDataset(
  words: readonly WordEntry[],
  language: Language,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (message: string, id?: string) =>
    issues.push({ level: "error", message, id });
  const warning = (message: string, id?: string) =>
    issues.push({ level: "warning", message, id });

  if (words.length === 0) {
    error(`Dataset for "${language}" is empty`);
    return issues;
  }

  const seenIds = new Map<string, number>();
  const seenWords = new Map<string, string>();
  const clueCounts = new Map<string, string[]>();

  for (const entry of words) {
    const id = typeof entry.id === "string" ? entry.id : "<missing-id>";

    if (typeof entry.id !== "string" || entry.id.trim() === "") {
      error("Entry is missing an id", id);
    } else {
      if (!ID_PATTERN.test(entry.id)) {
        error(`Id "${entry.id}" does not match the expected pattern`, id);
      }
      if (!entry.id.startsWith(`${language}-`)) {
        error(`Id "${entry.id}" does not start with the language prefix "${language}-"`, id);
      }
      const prior = seenIds.get(entry.id) ?? 0;
      if (prior > 0) error(`Duplicate id "${entry.id}"`, id);
      seenIds.set(entry.id, prior + 1);
    }

    if (typeof entry.word !== "string" || entry.word.trim() === "") {
      error("Entry has an empty word", id);
    } else {
      const key = normalize(entry.word);
      const existing = seenWords.get(key);
      if (existing) {
        error(`Duplicate word "${entry.word}" (also in ${existing})`, id);
      } else {
        seenWords.set(key, id);
      }
    }

    if (!isCategoryId(entry.category)) {
      error(`Unknown category "${String(entry.category)}"`, id);
    } else if (typeof entry.id === "string" && !entry.id.startsWith(`${language}-${entry.category}-`)) {
      error(`Id "${entry.id}" does not encode its category "${entry.category}"`, id);
    }

    if (typeof entry.clue !== "string" || entry.clue.trim() === "") {
      error("Entry has an empty clue", id);
    } else {
      const clueKey = normalize(entry.clue);
      if (typeof entry.word === "string" && clueKey === normalize(entry.word)) {
        error(`Clue equals the word "${entry.word}"`, id);
      }
      if (
        typeof entry.word === "string" &&
        entry.word.trim() !== "" &&
        (clueKey.includes(normalize(entry.word)) || normalize(entry.word).includes(clueKey)) &&
        clueKey !== normalize(entry.word)
      ) {
        warning(`Clue "${entry.clue}" contains or is contained by the word "${entry.word}"`, id);
      }
      if (entry.clue.trim().split(/\s+/).length > 3) {
        warning(`Clue "${entry.clue}" is long (>3 words)`, id);
      }
      const list = clueCounts.get(clueKey) ?? [];
      list.push(id);
      clueCounts.set(clueKey, list);
    }

    if (!DIFFICULTIES.has(entry.difficulty)) {
      error(`Invalid difficulty "${String(entry.difficulty)}"`, id);
    }
  }

  // A clue that is itself another secret word in the same language can leak
  // information across rounds; flag as a warning so curators can decide.
  for (const [clueKey, ids] of clueCounts) {
    const asWord = seenWords.get(clueKey);
    if (asWord && ids.length > 0) {
      warning(`Clue "${clueKey}" is also a word (${asWord}) in this language`, ids[0]);
    }
  }

  return issues;
}

export function assertValidDataset(words: readonly WordEntry[], language: Language): void {
  const errors = validateDataset(words, language).filter((i) => i.level === "error");
  if (errors.length > 0) {
    const preview = errors
      .slice(0, 10)
      .map((e) => `- ${e.message}${e.id ? ` [${e.id}]` : ""}`)
      .join("\n");
    throw new Error(
      `Dataset validation failed for "${language}" with ${errors.length} error(s):\n${preview}`,
    );
  }
}
