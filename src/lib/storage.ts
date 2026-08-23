import type { StateStorage } from "zustand/middleware";

/**
 * A defensive localStorage wrapper. If storage is unavailable (private mode,
 * disabled cookies, quota errors, SSR) it transparently falls back to an
 * in-memory map so the app keeps working for the current session.
 */

const memory = new Map<string, string>();

function getLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window.localStorage;
    // Accessing localStorage can throw in some privacy modes; probe it.
    const probeKey = "__malluimposter_probe__";
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return storage;
  } catch {
    return null;
  }
}

export const safeStorage: StateStorage = {
  getItem: (name) => {
    const ls = getLocalStorage();
    if (ls) {
      try {
        return ls.getItem(name);
      } catch {
        /* fall through to memory */
      }
    }
    return memory.get(name) ?? null;
  },
  setItem: (name, value) => {
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.setItem(name, value);
        return;
      } catch {
        /* fall through to memory */
      }
    }
    memory.set(name, value);
  },
  removeItem: (name) => {
    const ls = getLocalStorage();
    if (ls) {
      try {
        ls.removeItem(name);
      } catch {
        /* ignore */
      }
    }
    memory.delete(name);
  },
};

export const STORAGE_KEY = "malluimposter-storage";
