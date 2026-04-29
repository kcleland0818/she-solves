## Goal

Add a floating theme switcher with 4 presets: **Berry** (current default), **Calm** (muted blue-green), **Warm** (cream + terracotta), and **High Contrast** (near-black on near-white, WCAG AAA-aimed). Choice persists across visits. Default behavior is unchanged for users who don't open the switcher.

## How it works

Each theme is just a swap of the existing CSS custom properties already in `src/index.css` (`--background`, `--foreground`, `--primary`, `--card`, `--accent`, `--muted-foreground`, `--border`, `--ring`, etc.). Tailwind reads them via `hsl(var(--*))`, so every existing component automatically restyles — no component edits needed.

The active theme is stored as a `data-theme` attribute on `<html>`. CSS rules like `[data-theme="calm"] { --background: ...; ... }` override the `:root` defaults.

## Files to change/add

### 1. `src/index.css` — add theme variable blocks
After the existing `:root { ... }` block, add three new selectors: `[data-theme="calm"]`, `[data-theme="warm"]`, `[data-theme="high-contrast"]`. Each redefines the same set of variables `:root` already uses. Berry needs no block — it stays as `:root`.

Indicative palettes (HSL):
- **Calm**: bg `190 35% 96%`, fg `200 25% 20%`, primary `190 50% 42%`, accent `170 45% 45%`, muted-fg `200 20% 32%`
- **Warm**: bg `35 55% 95%`, fg `25 35% 18%`, primary `15 65% 50%`, accent `30 70% 55%`, muted-fg `25 25% 32%`
- **High Contrast**: bg `0 0% 100%`, fg `0 0% 8%`, primary `220 90% 35%`, accent `340 80% 35%`, muted-fg `0 0% 20%`, border `0 0% 30%`, ring `220 90% 35%`

Each contrast pair is checked against WCAG AA (4.5:1) for body text and AAA (7:1) for High Contrast.

### 2. `src/lib/theme.ts` — new file
Tiny module with the same shape as `progress.ts`:
- `type Theme = "berry" | "calm" | "warm" | "high-contrast"`
- `getStoredTheme()` / `setStoredTheme(t)` using `localStorage` key `shesolves:theme`
- `applyTheme(t)` sets `document.documentElement.dataset.theme` (omits attribute for `berry` to keep `:root` defaults)
- `getInitialTheme()` returns stored theme, else honors `prefers-contrast: more` → `high-contrast`, else `berry`
- All wrapped in try/catch + `typeof window` guards (matches existing pattern)

### 3. `src/main.tsx` — apply theme before React mounts
One added line: `applyTheme(getInitialTheme())` before `createRoot(...)`. This prevents a flash of default theme on reload.

### 4. `src/components/ThemeSwitcher.tsx` — new component
- Floating button bottom-right (mirrors `MiniCalculator`'s positioning style — likely `fixed bottom-4 right-4` stack offset so they don't overlap; calculator stays at right-4, theme button at right-20 or stacked above)
- Lucide `Palette` icon, `aria-label="Change color theme"`, `aria-expanded`, `aria-controls`
- Click opens a popover panel (plain div with focus trap + Escape to close, same pattern as `MiniCalculator`) listing 4 options as radio buttons
- Each option: small color swatch (3 dots showing bg/primary/accent of that theme), theme name, short description ("Soft & playful", "Muted & focused", "Cozy & warm", "Maximum readability")
- Uses `role="radiogroup"` with `aria-label="Color theme"`; each option is a `role="radio"` button with `aria-checked`
- On select: calls `setStoredTheme` + `applyTheme`, updates local state, closes panel, returns focus to opener
- Keyboard: arrow keys move between options, Enter/Space selects

### 5. `src/pages/Index.tsx` — mount the switcher
Add `<ThemeSwitcher />` alongside `<MiniCalculator />` inside the existing `Suspense`. Lazy-loaded the same way to avoid bloating the initial bundle. Visible on every screen (town map + shops), not gated by `showProgress`, so users can change theme from the welcome screen too — this means moving it out of the `showProgress` block, or rendering it at the page root in both `town` and `shop` branches.

Cleanest: render `<ThemeSwitcher />` once at the top of the `Index` component return, outside the conditional branches. Requires a small refactor — wrap the existing town/shop return in a fragment with the switcher always mounted.

## What stays the same

- Default Berry theme — no visual change for existing users until they opt in
- All scene-specific colors (smoothie fruits, bakery cream/frosting tokens) — these are separate CSS variables not touched by themes
- `prefers-reduced-motion` handling
- Existing `.dark` class block (untouched; not exposed in switcher)

## Out of scope

- Free color picker
- Per-shop theming
- Dark mode toggle (existing `.dark` styles aren't fully tested; deferred)
- Syncing theme across devices (localStorage only)

## Risk

Very low. Pure additive change. Worst case if the switcher has a bug: user's stored theme might apply unexpectedly — mitigated by a "Reset to Berry" option in the panel and graceful fallback in `getInitialTheme()`.
