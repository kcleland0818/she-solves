# Level Up Confidence Reinforcement

## Goal
Make every "you got it" moment as warm and specific as the Smoothie shop already is. Today:
- **Smoothie shop** — strong ("YES! Discount pro!", "You're crushing it!", per-step math callout)
- **Bakery** — neutral ("You got it!", "Perfect!")
- **Bookstore** — minimal ("Right!", "On to writing!")

Between scenes, every shop just shows a plain "Next →" button. No celebratory beat acknowledges what the learner just mastered before throwing them into the next one.

## Changes

### 1. Warm up correct-answer feedback (Bakery + Bookstore)

For each correct answer, follow the Smoothie shop pattern:
> **[Celebratory opener]** + [restate the math with their actual numbers] + [name the skill they just used].

Touched scenes & sample rewrites:

| Scene | Today | Become |
|---|---|---|
| BakeryScene1 (correct shade) | "Perfect! You shaded 5 of 6 slices — that's 5/6 of the cake." | "Yes! 5 shaded out of 6 total = **5/6**. You just read a fraction straight off a cake — that's the whole game!" |
| BakeryScene2 (equivalent) | (existing) | "Boom — 4/8 and 1/2 are the same slice of cake, just cut differently. Equivalent fractions, nailed it!" |
| BakeryScene3 (compare) | (existing) | "Yes! 3/4 > 2/3 because… [proof]. You just out-mathed two customers!" |
| BookstoreScene1 | "Right! $22 < $14 is true." | "Yes! $22 < $14 is **false** — the point of < goes to the smaller number. Reading inequalities = unlocked." |
| BookstoreScene2 | "Right! 'spend ≤ 20'…" | "Boom — 'no more than 20' means **spend ≤ 20**. Words → symbol, you just did the hardest part!" |
| BookstoreScene3 | (after build/sort) | "Shelf sorted! Every book obeys the rule **you wrote**. That's how real catalogs work." |

A small helper file `src/lib/celebrate.ts` will export:
- `celebratoryOpener()` — picks from `["Yes!", "Boom —", "Nailed it!", "There it is!", "Yes, chef!", "Locked in!"]` (slight bakery/bookstore-flavored variants per shop)
- `skillBeat(skill: string)` — short closer like `"That's ${skill} — unlocked."`

Used inside each scene's existing `setFeedback(...)` call site for correct answers only. Wrong-answer text stays gentle and specific (unchanged).

### 2. Between-scene celebratory beat (all 3 shops)

Today, hitting "Next Scene →" instantly mounts the next scene. New behavior: when a scene's `phase === "done"`, the existing speech bubble already runs a "you did it" line — we'll extend it with a one-line **skill-stamp** rendered above the Next button:

```
┌──────────────────────────────┐
│ ✨ Skill unlocked: Equivalent │
│         Fractions             │
└──────────────────────────────┘
[ Try Another ]  [ Next Scene → ]
```

Implementation: a small `<SkillStamp label="Equivalent Fractions" />` component (CSS pulse animation, respects `prefers-reduced-motion`), inserted in the `phase === "done"` block of all 9 scenes. No routing or state changes.

### 3. Polish completion screens

- **Smoothie** `CompletionScreen` — already warm, leave alone.
- **BakeryCompletion** — add a 1-line per-skill micro-celebration above each skill card (e.g. "🍰 You sliced 8 cakes correctly").
- **BookstoreCompletion** — same treatment (e.g. "📖 You read 6 inequalities").

Counts come from sessionStorage progress that's already being written; if a value is missing we just hide the line.

## Out of scope (deferred)
- Reflection prompts ("mentor asks, learner thinks" pattern) — picked as a future direction but not this pass per priority answer.
- Per-scene "why this matters" hook line.
- Bookstore Scene 3 keyboard alternative — already shipped.

## Technical notes
- All new copy lives in scene files + `src/lib/celebrate.ts`.
- New component `src/components/SkillStamp.tsx` (~30 lines, uses existing tailwind tokens, no new deps).
- No business-logic changes, no new state machines, no routing changes.
- A11y: skill stamp gets `role="status"` + `aria-live="polite"` so it's announced once when shown.
- Re-run `.tmp-a11y/audit.spec.ts` after changes to confirm no contrast regressions on new chip.

## Files touched
- new: `src/lib/celebrate.ts`
- new: `src/components/SkillStamp.tsx`
- edit: `src/components/BakeryScene1.tsx`, `BakeryScene2.tsx`, `BakeryScene3.tsx`
- edit: `src/components/BookstoreScene1.tsx`, `BookstoreScene2.tsx`, `BookstoreScene3.tsx`
- edit: `src/components/Scene1Ratios.tsx`, `Scene2Percentages.tsx`, `Scene3Discounts.tsx` (just add `<SkillStamp />`)
- edit: `src/components/BakeryCompletion.tsx`, `BookstoreCompletion.tsx`
