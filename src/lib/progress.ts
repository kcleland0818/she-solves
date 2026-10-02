// Lightweight localStorage helpers for shop + per-activity progress.

const COMPLETION_KEY = "shesolves:completedShops";
const ACTIVITIES_KEY = "shesolves:activities";
const PRACTICE_KEY = "shesolves:practice";

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

// Per-activity tracking. Stored as Record<lessonId, string[]> so future UI
// (resume / per-skill dashboard) has data ready without another refactor.
type ActivityMap = Record<string, string[]>;

const readActivities = (): ActivityMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACTIVITIES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: ActivityMap = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (Array.isArray(v)) out[k] = v.filter((x) => typeof x === "string");
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
};

const writeActivities = (map: ActivityMap) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

export const getCompletedActivities = (lessonId: string): string[] =>
  readActivities()[lessonId] ?? [];

export const isActivityCompleted = (lessonId: string, activityId: string): boolean =>
  getCompletedActivities(lessonId).includes(activityId);

export const markActivityCompleted = (lessonId: string, activityId: string): void => {
  const map = readActivities();
  const list = map[lessonId] ?? [];
  if (!list.includes(activityId)) {
    map[lessonId] = [...list, activityId];
    writeActivities(map);
  }
};

// Practice-mode stats. Stored as Record<lessonId, number> = rounds solved.
type PracticeMap = Record<string, number>;

const readPractice = (): PracticeMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PRACTICE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: PracticeMap = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[k] = v;
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
};

export const getPracticeRounds = (lessonId: string): number =>
  readPractice()[lessonId] ?? 0;

export const markPracticeRound = (lessonId: string): void => {
  if (typeof window === "undefined") return;
  const map = readPractice();
  map[lessonId] = (map[lessonId] ?? 0) + 1;
  try {
    window.localStorage.setItem(PRACTICE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
};

export const resetProgress = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(COMPLETION_KEY);
    window.localStorage.removeItem(ACTIVITIES_KEY);
    window.localStorage.removeItem(PRACTICE_KEY);
  } catch {
    // Storage unavailable; fail silently.
  }
};
