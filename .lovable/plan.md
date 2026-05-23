# Accessibility check after the SlicePicker refactor

## What we're verifying

The refactor moved `BakeryScene1`'s rendering into `src/components/templates/SlicePicker.tsx`. JSX, ARIA, and keyboard handlers were copied verbatim (slice `role="button"` + `aria-pressed` + Enter/Space handling, `aria-live` status, labelled SVG group, hint `aria-expanded`). That means no regressions are *expected* — but we want signal, not vibes.

Two layers of check:

1. **Static code review** — already done while writing the refactor:
   - `SlicePicker` keeps every ARIA attribute the original had.
   - `BakeryScene1` is now a thin wrapper, no a11y surface of its own.
   - Existing `SkillsDashboard` trigger button has an `aria-label` and `sr-only` count text — good.
   - One pre-existing observation worth flagging: `SkillsDashboard`'s mobile trigger is `w-8 h-10` (32×40px), below the 44×44 WCAG 2.5.5 tap-target target. This predates today's work; flag and offer to fix.

2. **Automated axe run** — the project already has `tests/a11y-all-shops.spec.ts` (axe-core over every shop, every scene, including the bakery). That's the right tool to validate the refactor end-to-end.

## Plan

1. Run `tests/a11y-all-shops.spec.ts` via the test runner and capture the `AXE_RESULT::` lines for the bakery scenes specifically.
2. Compare violations to a clean baseline — anything new = regression from the refactor.
3. If clean: report the pass and move on (back to extracting `Scene1Ratios` → `RatioMixer` per the scaling plan).
4. If any new violations: fix in `SlicePicker.tsx` before continuing the scaling work.
5. Separately, ask whether to bump the `SkillsDashboard` mobile trigger to `min-h-11 min-w-11` since it's the one pre-existing item the review surfaced.

## Technical section

- The axe spec uses a custom playwright fixture (`playwright-fixture.ts`) and emits results as `AXE_RESULT::{json}` console lines per scene. Easy to grep.
- Tags scanned: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice` — broad enough to catch the things that matter for an education app aimed at kids.
- The runner needs the preview dev server running; the existing playwright config already handles that.

Ready to switch to build mode and run it?
