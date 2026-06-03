# Finish the bakery extraction

Last two scene components still carrying their own state and JSX. After this, every shop scene in the app is a thin wrapper over a template in `src/components/templates/` driven by JSON in `src/content/<shop>/`.

## 1. BakeryScene2 → `FrostingTray` template

The scene teaches equivalent fractions on a grid of cupcakes: explore phase lets the learner pick a tray shape and shade cells freely (with a live simplified-fraction readout), challenge phase asks them to shade a specific equivalent like `1/3` on a 2×3 tray.

**Create `src/components/templates/FrostingTray.tsx`**
- Props: `content`, `onComplete`, `SpeechComponent` (defaults to `PennySpeech`), optional theme override (defaults to `bakery`).
- Owns all phase/shaded/feedback/hint state currently in `BakeryScene2`.
- Keeps the `gcd`/`simplify` helpers and the live "same as n/d" readout in explore.
- Preserves every ARIA attribute already on the scene: `aria-labelledby` heading, `role="grid"` + descriptive label on the tray, per-cell `aria-pressed`/`aria-label`, `aria-live` sr-only counter, `role="status"` feedback, `aria-expanded` hint toggle.
- Themed via the same `THEME` map pattern used in `BuildAndSort` (bakery: `bakery-frosting`, `bakery-cream`, `bakery-chocolate`, `bakery-tray`, `bakery-frosting-deep`, `bakery-crust`). Future shops can drop in their own palette.

**Create `src/content/bakery/scene2.json`**
- `heading`, `headingEmoji`
- `exploreTrays[]` — `{ rows, cols, label }`
- `challenges[]` — `{ rows, cols, target, equivLabel, trayLabel }`
- `speech` — `explore` / `challenge` / `done` templates with `{shaded}`, `{total}`, `{simplified}`, `{equivLabel}`, `{trayLabel}` slots
- `buttons` — labels for "Try a Customer Order!", "Check the Tray", "Try Another Tray", "Next Scene"
- `skill` — "Equivalent Fractions"
- `theme` — "bakery"

**Update `src/components/BakeryScene2.tsx`** — thin wrapper passing the JSON content + `onComplete` into `FrostingTray`.

## 2. BakeryScene3 → `FractionCompare` template

The scene compares two fractions side-by-side as filled pastry trays. Explore lets the learner pick two fractions from a list and see the comparison + LCD proof; challenge presents preset pairs (including a tie) and the learner picks which is bigger or "they're equal".

**Create `src/components/templates/FractionCompare.tsx`**
- Props: `content`, `onComplete`, `SpeechComponent` (defaults to `PennySpeech`), `customerAvatars` (so the avatars stay shop-specific via import in the wrapper).
- Lifts the inline `FractionPastry` sub-component in here.
- Owns phase/explore selection/challenge index/selected/feedback/hint state.
- Computes `winner`, `isTie`, and `exploreCompare` exactly as today; uses `Inequality` for the explore LCD proof.
- Preserves: `aria-labelledby` heading, per-tray `aria-label`, `aria-pressed` on "They're equal!", `aria-live` polite explore readout, `role="status"` feedback, `aria-expanded` hint toggle, hidden customer-name span for screen readers.

**Create `src/content/bakery/scene3.json`**
- `heading`, `headingEmoji`
- `exploreOptions[]` — `[{ num, den }, ...]`
- `challenges[]` — `[{ a: {num,den}, b: {num,den} }, ...]` (including the existing 4/6 vs 2/3 tie)
- `speech` — `explore` / `challenge` / `done` templates (explore template needs to support the structured LCD proof with `<Inequality>`, so it stays a render function in the template, fed by content strings)
- `customerNames` — `{ a: "Maya", b: "Avery" }`
- `buttons` — "Take Real Orders!", "They're equal!", "Next Customer Pair", "Finish Lesson"
- `skill` — "Comparing Fractions"
- `theme` — "bakery"

**Update `src/components/BakeryScene3.tsx`** — thin wrapper that imports `mayaAvatar` + `averyAvatar` and the JSON, passes everything into `FractionCompare`.

## 3. Verify

- Vitest run (the existing suite touches the bakery scenes).
- Manual smoke in the preview: walk both bakery scenes through explore → challenge → done; confirm the equivalent-fraction simplify readout, the tie case in scene 3, and the LCD proof in explore still behave identically.
- Re-run `tests/a11y-audit.spec.ts` against the bakery flow to confirm zero new axe violations.

## Technical notes

- Speech with mixed text + components (`<Inequality>` in scene 3 explore): the template renders the JSX directly with values from `content` — the JSON holds copy fragments and the template assembles them. Pure-string speech (scene 2) uses simple `{slot}` interpolation.
- `THEME` map lives at the top of each template (same pattern as `BuildAndSort`) so no Tailwind classes need to be dynamic-string-built.
- No business-logic changes: same challenge lists, same skill labels, same celebration copy via `celebratoryOpener("bakery")` + `skillBeat(...)`.
- After this, `src/components/Bakery*.tsx` mirrors the smoothie + bookstore shape: every scene file is a ~10-line wrapper.
