## Why the preview keeps flashing white and dropping back to the map

There is **no runtime crash and no auto-reload from the deployed app** — I checked runtime errors (none) and the dev-server log (only HMR updates, no `page reload` while you're playing). The behavior you're seeing while iterating is two separate things stacking up:

### 1. Vite HMR is doing full page reloads while I edit (the real cause)

`src/main.tsx` has top-level side effects that run on every import:

```ts
applyTheme(getInitialTheme());
applyMotionPref(getStoredMotion());
applyColorMode(getStoredColorMode());
subscribeToSystemColorMode(...);

const preloadLink = document.createElement("link");
...
document.head.appendChild(preloadLink);

createRoot(...).render(<App />);
```

Vite cannot hot-replace a module that mounts the React root and mutates `document.head`, so any change that propagates up to `main.tsx` (or any module change while the app is loading) causes Vite to do a **full page reload** instead of HMR. The dev log confirms it: `[vite] page reload src/main.tsx`.

A full reload re-runs `Index.tsx` from scratch. Since the current scene is stored only in component state (`useState<Screen>({ kind: "town" })`), the app boots back to the town map — exactly the "white flash → map" symptom. This won't happen for end users in the deployed build, but it's disruptive while developing and during preview hot updates.

### 2. The Suspense fallback for lazy scenes is invisible

In `src/pages/Index.tsx`:

```tsx
<Suspense fallback={<div className="min-h-[40vh]" aria-busy="true" />}>
```

When you click "Next Scene", the next chunk (`Scene2Percentages`, `BakeryScene2`, etc.) has to load. During that brief window the fallback is a literally empty div on a `bg-background` page — i.e. a white (or themed-bg) flash. On a slow network it looks like the app blanked out.

---

## Plan

### A. Make scene state survive a reload (also a nice UX win)

Persist the current screen to `sessionStorage` so HMR reloads — and accidental browser refreshes mid-activity — don't kick the learner back to the map.

- In `src/pages/Index.tsx`:
  - Add `getInitialScreen()` / `saveScreen()` helpers backed by `sessionStorage` under key `shesolves:screen`.
  - Initialize `useState<Screen>(getInitialScreen)`.
  - `useEffect` to persist `screen` whenever it changes.
  - Validate the stored shape (`kind`, `shop`, `stage`) before using it; fall back to `{ kind: "town" }` on any mismatch.

Use `sessionStorage` (not `localStorage`) so closing the tab still starts fresh at the map — matches the existing "shop completed" semantics where `localStorage` is reserved for true progress.

### B. Reduce HMR full-reloads from `main.tsx`

Move the side-effects out of the module top level so editing related files doesn't force a full reload:

- Keep `createRoot(...).render(<App />)` in `main.tsx`.
- Move the preload-link creation behind an `if (!document.querySelector('link[data-preload="town-map"]'))` guard and tag the link with that attribute, so re-runs are idempotent.
- The theme/motion/color-mode `apply*` calls are already idempotent (they just toggle a class / data attr), so they're fine to leave — the bigger win is the guarded preload.

This won't eliminate every Vite full-reload (entry modules sometimes still reload), but combined with (A) the user no longer notices, because state survives.

### C. Give the Suspense fallback something visible

Replace the empty fallback in `src/pages/Index.tsx` with a small centered loader that uses theme tokens:

```tsx
<Suspense fallback={
  <div className="min-h-[40vh] flex items-center justify-center" aria-busy="true" aria-live="polite">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <div className="w-8 h-8 rounded-full border-2 border-muted border-t-primary animate-spin" aria-hidden="true" />
      <span className="text-sm">Loading…</span>
    </div>
  </div>
} >
```

Respects `prefers-reduced-motion` (the `motion.ts` system already disables `animate-*` via the `.motion-reduced` class — no extra work needed).

### D. Quick verification

- Click into Berry Bliss → advance to Scene 2 → manually refresh the browser → you should land back on Scene 2, not the map.
- Click "Back" via the existing refresh/exit flow → still returns to the map (sessionStorage gets overwritten with `{ kind: "town" }`).
- Switch themes / dark mode while inside a scene → no map bounce.

### Files touched

- `src/pages/Index.tsx` — sessionStorage persistence + nicer Suspense fallback.
- `src/main.tsx` — guard the preload link insertion.

No new dependencies. No changes to scene components, theming, or the existing shop-completion `localStorage` logic.
