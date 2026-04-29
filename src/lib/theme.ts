// Theme persistence + application. Kept tiny and dependency-free.

export type Theme = "berry" | "calm" | "warm" | "high-contrast";

export const THEMES: Theme[] = ["berry", "calm", "warm", "high-contrast"];

const STORAGE_KEY = "shesolves:theme";

const isTheme = (v: unknown): v is Theme =>
  typeof v === "string" && (THEMES as string[]).includes(v);

export const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const setStoredTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable; fail silently.
  }
};

export const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "berry") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
};

export const getInitialTheme = (): Theme => {
  const stored = getStoredTheme();
  if (stored) return stored;
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        return "high-contrast";
      }
    } catch {
      // ignore
    }
  }
  return "berry";
};

// Swatch colors for the picker UI (raw CSS color strings — used only inside
// the switcher to preview themes; the actual app styling comes from CSS vars).
export const THEME_META: Record<
  Theme,
  { label: string; description: string; swatches: [string, string, string] }
> = {
  berry: {
    label: "Berry",
    description: "Soft & playful (default)",
    swatches: ["hsl(280, 40%, 97%)", "hsl(280, 55%, 48%)", "hsl(340, 65%, 55%)"],
  },
  calm: {
    label: "Calm",
    description: "Muted & focused",
    swatches: ["hsl(190, 35%, 96%)", "hsl(190, 50%, 42%)", "hsl(170, 45%, 45%)"],
  },
  warm: {
    label: "Warm",
    description: "Cozy & warm",
    swatches: ["hsl(35, 55%, 95%)", "hsl(15, 65%, 50%)", "hsl(30, 70%, 55%)"],
  },
  "high-contrast": {
    label: "High Contrast",
    description: "Maximum readability",
    swatches: ["hsl(0, 0%, 100%)", "hsl(220, 90%, 35%)", "hsl(340, 80%, 35%)"],
  },
};
