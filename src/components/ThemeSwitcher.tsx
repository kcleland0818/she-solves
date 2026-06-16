import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Check, Monitor, Sun, Moon } from "lucide-react";
import {
  type Theme,
  THEMES,
  THEME_META,
  applyTheme,
  setStoredTheme,
  getInitialTheme,
} from "@/lib/theme";
import {
  type MotionPref,
  getStoredMotion,
  setStoredMotion,
  applyMotionPref,
  isMotionReduced,
} from "@/lib/motion";
import {
  type ColorMode,
  getStoredColorMode,
  setStoredColorMode,
  applyColorMode,
} from "@/lib/color-mode";

const COLOR_MODES: ColorMode[] = ["system", "light", "dark"];
const COLOR_MODE_META: Record<ColorMode, { label: string; Icon: typeof Sun }> = {
  system: { label: "System", Icon: Monitor },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
};

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [motion, setMotion] = useState<MotionPref>(() => getStoredMotion());
  const [colorMode, setColorMode] = useState<ColorMode>(() => getStoredColorMode());
  const [open, setOpen] = useState(false);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const modeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const chooseColorMode = useCallback((next: ColorMode) => {
    setColorMode(next);
    setStoredColorMode(next);
    applyColorMode(next);
  }, []);

  const handleModeKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      modeRefs.current[(idx + 1) % COLOR_MODES.length]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      modeRefs.current[(idx - 1 + COLOR_MODES.length) % COLOR_MODES.length]?.focus();
    }
  };

  const reduced = isMotionReduced(motion);

  const toggleMotion = useCallback(() => {
    // Tri-state cycle, but the toggle just flips between on/off based on
    // current effective state (most users want a simple switch).
    const next: MotionPref = reduced ? "off" : "on";
    setMotion(next);
    setStoredMotion(next);
    applyMotionPref(next);
  }, [reduced]);

  const choose = useCallback((next: Theme) => {
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  }, []);

  // Close on Escape; click-outside; focus first selected option when opening.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        openBtnRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    // Focus the currently selected option for keyboard users.
    const idx = THEMES.indexOf(theme);
    optionRefs.current[idx]?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, theme]);

  const handleOptionKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % THEMES.length;
      optionRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (idx - 1 + THEMES.length) % THEMES.length;
      optionRefs.current[next]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      optionRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      optionRefs.current[THEMES.length - 1]?.focus();
    }
  };

  return (
    <>
      <button
        ref={openBtnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          fixed z-50
          top-1/3 right-0 rounded-l-full rounded-r-none w-11 h-11 border-r-0
          md:top-auto md:bottom-4 md:right-20 md:rounded-full md:rounded-l-full md:w-12 md:h-12 md:border-r
          bg-card text-foreground border border-border
          flex items-center justify-center shadow-lg
          hover:scale-105 md:hover:scale-110 transition-transform
          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        "
        aria-label="Change color theme"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="theme-switcher-panel"
      >
        <Palette className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={panelRef}
          id="theme-switcher-panel"
          role="dialog"
          aria-label="Color theme"
          className="fixed top-4 right-2 bottom-4 md:top-auto md:bottom-20 md:right-4 z-50 w-72 max-w-[calc(100vw-1rem)] md:max-h-[calc(100vh-6rem)] max-h-[calc(100vh-2rem)] overflow-y-auto bg-card border border-border rounded-2xl shadow-xl p-3 animate-fade-in"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" aria-hidden="true" />
              Color theme
            </span>
            <button
              type="button"
              onClick={() => { setOpen(false); openBtnRef.current?.focus(); }}
              className="min-w-[32px] min-h-[32px] text-muted-foreground hover:text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label="Close theme picker"
            >
              ✕
            </button>
          </div>

          <div role="radiogroup" aria-label="Color theme" className="flex flex-col gap-1.5">
            {THEMES.map((t, idx) => {
              const meta = THEME_META[t];
              const selected = theme === t;
              return (
                <button
                  key={t}
                  ref={(el) => { optionRefs.current[idx] = el; }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => choose(t)}
                  onKeyDown={(e) => handleOptionKey(e, idx)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="flex -space-x-1.5 flex-shrink-0" aria-hidden="true">
                    {meta.swatches.map((c, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 rounded-full border border-border"
                        style={{ background: c }}
                      />
                    ))}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {meta.label}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {meta.description}
                    </span>
                  </span>
                  {selected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                Appearance
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Appearance"
              className="grid grid-cols-3 gap-1.5"
            >
              {COLOR_MODES.map((m, idx) => {
                const { label, Icon } = COLOR_MODE_META[m];
                const selected = colorMode === m;
                return (
                  <button
                    key={m}
                    ref={(el) => { modeRefs.current[idx] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => chooseColorMode(m)}
                    onKeyDown={(e) => handleModeKey(e, idx)}
                    className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  Reduce motion
                </span>
                <span className="block text-xs text-muted-foreground leading-snug">
                  Turn off animations and transitions.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={reduced}
                onClick={toggleMotion}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  reduced ? "bg-primary" : "bg-muted"
                }`}
              >
                <span className="sr-only">Reduce motion</span>
                <span
                  aria-hidden="true"
                  className={`inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform ${
                    reduced ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </label>
          </div>

          <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
            Your choices are saved on this device.
          </p>
        </div>
      )}
    </>
  );
};

export default ThemeSwitcher;
