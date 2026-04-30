## Goal

Add a **light / dark / system** color-mode control that works on top of all four existing themes (Berry, Calm, Warm, High Contrast). Persists per device in localStorage, defaults to following the OS, and applies before React mounts to avoid a flash.

## Design choices

- **Three states, not a toggle**: `system` (follow OS), `light`, `dark`. "System" is the default — it's what users almost always want, and it stays in sync if they flip OS dark mode at night.
- **Lives on top of themes, not inside them**: dark mode is orthogonal to the color theme. Picking "Calm + Dark" should give a dark calm palette, not force you back to Berry.
- **Same shape as `motion.ts`**: `auto` / explicit override pattern. Keeps the codebase consistent and migration-friendly when accounts arrive.
- **Stays in localStorage forever**: as discussed, this is a device preference. It will not move to Cloud when accounts ship.

## Files

### 1. `src/lib/color-mode.ts` (new)
Mirrors `motion.ts` exactly in shape:
- `type ColorMode = "system" | "light" | "dark"`
- `getStoredColorMode()` / `setStoredColorMode(mode)` — key `shesolves:color-mode`, removes the key when set to `system`
- `systemPrefersDark()` — wraps `matchMedia("(prefers-color-scheme: dark)")`
- `isDark(mode?)` — resolves effective state
- `applyColorMode(mode)` — toggles the `dark` class on `<html>` (Tailwind already configured for `darkMode: ["class"]`)
- `subscribeToSystemColorMode(cb)` — listens to OS changes and re-applies, but only while the stored mode is `system`. Returns an unsubscribe function.

All wrapped in `try`/`catch` + `typeof window` guards.

### 2. `src/index.css` — add dark variants for the three non-default themes
Currently only `:root` (Berry light) and `.dark` (Berry dark) exist. Calm/Warm/High-Contrast have no dark variants, so toggling dark mode while on those themes would fall back to Berry-dark, which looks broken.

Add three new selector blocks:
- `[data-theme="calm"].dark { ... }` — dark calm: deep teal background, lighter primary
- `[data-theme="warm"].dark { ... }` — dark warm: deep brown/cocoa background, warm orange primary
- `[data-theme="high-contrast"].dark { ... }` — pure black bg / pure white fg, AAA-aimed

Each redefines the same semantic tokens the light variant defines. Each contrast pair is checked against WCAG AA (body text 4.5:1) and AAA (7:1) for the high-contrast variant.

Indicative HSLs:
- **Calm dark**: bg `200 30% 10%`, fg `190 15% 92%`, primary `190 60% 60%`, accent `170 55% 55%`, muted-fg `190 15% 70%`, border `200 20% 22%`
- **Warm dark**: bg `25 25% 10%`, fg `35 25% 92%`, primary `15 70% 60%`, accent `30 75% 60%`, muted-fg `30 20% 70%`, border `25 20% 22%`
- **High-contrast dark**: bg `0 0% 0%`, fg `0 0% 100%`, primary `210 100% 75%`, accent `340 100% 75%`, muted-fg `0 0% 85%`, border `0 0% 75%`

### 3. `src/main.tsx` — apply before mount
Two added lines next to the existing theme/motion calls:
```ts
applyColorMode(getStoredColorMode());
```
And subscribe to OS changes once at module level so `system` mode auto-updates without React having to re-render:
```ts
subscribeToSystemColorMode(() => applyColorMode(getStoredColorMode()));
```

### 4. `src/components/ThemeSwitcher.tsx` — add an "Appearance" section
Add a new section to the existing panel, between the theme radio group and the "Reduce motion" switch, separated with a `border-t` divider (same pattern as motion).

- Heading: small label "Appearance" with a `Sun`/`Moon` icon (lucide)
- A 3-button segmented control: **System** / **Light** / **Dark**
- Implemented as `role="radiogroup"` with three `role="radio"` buttons; same arrow-key navigation pattern already used for theme selection (factor out a tiny `radioKeyHandler` helper or inline — both fine)
- Selected state uses the same `border-primary bg-primary/10` styling as the theme options
- Icons: `Monitor` (system), `Sun` (light), `Moon` (dark) from lucide-react
- On select: updates state, calls `setStoredColorMode` + `applyColorMode`, keeps panel open (matches motion toggle UX)

### 5. No change needed elsewhere
- `tailwind.config.ts` already has `darkMode: ["class"]`
- All existing components use semantic tokens (`bg-card`, `text-foreground`, etc.), so they restyle automatically
- The existing scene-specific tokens (smoothie/bakery palettes) stay light-only intentionally — those are illustrative colors that should look the same in both modes

## Out of scope

- Per-shop dark variants of the smoothie/bakery scene palettes (they read fine as-is on dark surfaces; can revisit if QA flags any)
- Syncing across devices (deferred to accounts work)
- Auto-switch on a schedule (sunset/sunrise)

## Risk

Low. Additive change. Worst case: a specific dark+theme combination has weak contrast somewhere — mitigated by checking the three new palettes against WCAG before shipping, and by the existing High Contrast theme always being available as an escape hatch.
