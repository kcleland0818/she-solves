// Lightweight localStorage helpers for shop progress.
// Keep API stable so future shops (Sweet Crumbs, etc.) can reuse it.

const COMPLETION_KEY = "shesolves:completedShops";

const readSet = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(COMPLETION_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.filter((x) => typeof x === "string"));
    return new Set();
  } catch {
    return new Set();
  }
};

const writeSet = (set: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COMPLETION_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Storage unavailable (private mode, quota); fail silently.
  }
};

export const getCompletedShops = (): Set<string> => readSet();

export const isShopCompleted = (shopId: string): boolean => readSet().has(shopId);

export const markShopCompleted = (shopId: string): void => {
  const set = readSet();
  set.add(shopId);
  writeSet(set);
};

export const resetProgress = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(COMPLETION_KEY);
  } catch {
    // Storage unavailable; fail silently.
  }
};
