
The user is right — `KeyboardShortcutsHint` is irrelevant on mobile (no physical keyboard, no Tab/arrows). Looking at `src/pages/Index.tsx`, it's rendered unconditionally whenever `showProgress` is true, so it currently does pop up on phones.

We already have `useIsMobile()` (`src/hooks/use-mobile.tsx`) which returns true under 768px — perfect fit.

### Plan

**Hide the keyboard hint on mobile**

1. In `src/components/KeyboardShortcutsHint.tsx`: import `useIsMobile`, and return `null` early if `useIsMobile()` is true. Also skip the localStorage write/timer on mobile so we don't accidentally mark it dismissed before the user ever resizes to desktop.

2. (Optional, but cleaner) In `src/pages/Index.tsx`: leave the render call as-is — the component itself owns the "should I show?" logic, which keeps `Index.tsx` simple.

**Bonus consideration — MiniCalculator on mobile**
The floating calculator *is* still useful on mobile (tap-to-use), so we leave it visible. Its keyboard-input affordance just becomes a no-op on touch devices, which is fine.

### Files to change
- `src/components/KeyboardShortcutsHint.tsx` — add `useIsMobile()` guard at the top, return `null` on mobile.

That's it — one tiny, targeted change.
