# Endless Practice Mode

Let learners replay fraction challenges forever with freshly generated content — no two practice runs alike. Built on the existing `fractionIdentification` generator (currently pinned to seed 42 in Bakery Scene 1).

## How it works

```text
BakeryCompletion
   └─ "Practice Fractions" button
        └─ LessonRunner enters a new "practice" stage
             └─ BakeryPractice (new registered component)
                  └─ SlicePicker with a random seed
                       └─ "New Challenge" re-rolls the seed → brand-new orders
```

Practice is a special runner stage, **not** a lesson activity — so it never appears in the progress bar or `progressLabels`, and finishing it doesn't re-mark the shop.

## Pieces

### 1. `BakeryPractice.tsx` (new component, registered)
- Generates a random seed on mount (`Math.floor(Math.random() * 2**31)`), held in state.
- Renders `SlicePicker` with `generateFractionLesson({ seed })`.
- "New Challenge" button re-rolls the seed → entirely new challenge bank (not just another order from the same bank).
- "Back to Wrap-Up" button returns to the completion screen.
- Skips the free-explore phase (add an optional `startPhase?: "explore" | "challenge"` prop to `SlicePicker`, default `"explore"`) — practice drops straight into customer orders.

### 2. LessonRunner: new `practice` stage
- `RunnerStage` gains `{ kind: "practice" }`.
- Completion screens get a new optional prop `onPractice?: () => void`; the runner passes it when the lesson declares practice support.
- Lesson JSON gains an optional `"practice": "BakeryPractice"` field (validated like `welcome`/`completion` — must be a known registry ID if present). Only `bakery.json` gets it for now.
- `onPractice` → `setStage({ kind: "practice" })`; the practice component's exit → back to `{ kind: "complete" }`.
- Session persistence: practice stage persists like any other stage, but the seed is intentionally **not** persisted — a reload during practice just deals a fresh set.

### 3. `BakeryCompletion.tsx`: practice entry point
- New optional `onPractice` prop; when present, render a "Practice Fractions 🔁" button next to "Back to Town".
- Show the learner's practice round count (see below) as a small confidence line: "You've solved N practice orders!"

### 4. Practice stats in `progress.ts`
- New `shesolves:practice` key: `Record<lessonId, number>` (rounds completed).
- `markPracticeRound(lessonId)` / `getPracticeRounds(lessonId)`.
- `BakeryPractice` calls `markPracticeRound` each time a challenge is answered correctly (on the SlicePicker `done` phase), and `resetProgress` clears the new key too.

### 5. SlicePicker tweak
- Optional `startPhase` prop (default `"explore"`) — practice starts in `"challenge"`.
- No other changes; the template already supports any challenge bank.

## Verification

- Vitest run (generator tests unaffected).
- Manual smoke: complete the bakery → "Practice Fractions" → solve orders → "New Challenge" deals a different set (verify visually across a few rolls) → "Back to Wrap-Up" → "Back to Town".
- Reload mid-practice → lands back in practice with a fresh set, no crash.
- Run the a11y suite — the practice flow reuses SlicePicker, so no new violations expected; confirm the completion screen's new button passes.

## Technical notes

- Random seeds use `Math.random()` — practice doesn't need determinism; the pinned seed 42 stays for the story Scene 1.
- The `practice` field in lesson JSON keeps this extensible: when a second generator lands (e.g. ratios), its shop just adds `"practice": "SmoothiePractice"` — no runner changes.
- Practice rounds count is data-only groundwork; a future Skills Dashboard can surface it.

## Out of scope

- Practice modes for smoothie/bookstore (no generators for those skills yet).
- Difficulty progression (e.g. larger denominators as rounds increase) — the generator already supports `denominators`/`count` options, so this is a follow-up.
- Timed/arcade modes, streaks, leaderboards.
