// Color mode (light/dark/system) preference. Persisted per device.
// Mirrors the shape of motion.ts.

const STORAGE_KEY = "shesolves:color-mode";

export type ColorMode = "system" | "light" | "dark";

export const getStoredColorMode = (): ColorMode => {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return "system";
  } catch {
    return "system";
  }
};

export const setStoredColorMode = (mode: ColorMode): void => {
  if (typeof window === "undefined") return;
  try {
    if (mode === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
};

export const systemPrefersDark = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
};

export const isDark = (mode: ColorMode = getStoredColorMode()): boolean => {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return systemPrefersDark();
};

export const applyColorMode = (mode: ColorMode): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isDark(mode)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

// Listen to OS color-scheme changes and re-apply, but only while the stored
// preference is "system". Returns an unsubscribe function.
export const subscribeToSystemColorMode = (cb: () => void): (() => void) => {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  try {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getStoredColorMode() === "system") cb();
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  } catch {
    return () => {};
  }
};
