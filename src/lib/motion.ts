// Reduce-motion preference: persisted user override on top of the
// OS-level `prefers-reduced-motion` media query.

const STORAGE_KEY = "shesolves:reduce-motion";

export type MotionPref = "auto" | "on" | "off";

export const getStoredMotion = (): MotionPref => {
  if (typeof window === "undefined") return "auto";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "on" || raw === "off" || raw === "auto") return raw;
    return "auto";
  } catch {
    return "auto";
  }
};

export const setStoredMotion = (pref: MotionPref): void => {
  if (typeof window === "undefined") return;
  try {
    if (pref === "auto") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // ignore
  }
};

const systemPrefersReduced = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

// Resolve the effective state ("on" means reduce motion is active).
export const isMotionReduced = (pref: MotionPref = getStoredMotion()): boolean => {
  if (pref === "on") return true;
  if (pref === "off") return false;
  return systemPrefersReduced();
};

export const applyMotionPref = (pref: MotionPref): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isMotionReduced(pref)) {
    root.dataset.reduceMotion = "true";
  } else {
    delete root.dataset.reduceMotion;
  }
};
