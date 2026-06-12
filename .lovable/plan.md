# Step 4: Lesson Runner

Not done yet. Today `src/pages/Index.tsx` hardcodes three near-identical shop branches — each manually lists welcome → scene1 → scene2 → scene3 → completion and wires `onComplete` to the next stage. Adding a 4th bakery scene means editing the `Stage` union, `stageIndex`, `VALID_STAGES`, `SHOP_PROGRESS_LABELS`, and the bakery JSX branch. That's exactly the seam the lesson runner removes.

## Goal

One `LessonRunner` component takes a `lessonId`, loads a lesson JSON describing the activity sequence, walks the activities, tracks per-activity completion, and hands off to the next — replacing the per-shop branches in `Index.tsx`.

## Lesson JSON shape

New folder `src/content/lessons/` with one file per shop:

```
src/content/lessons/smoothie.json
src/content/lessons/bakery.json
src/content/lessons/bookstore.json
```

Each file:

```json
{
  "id": "bakery",
  "shopName": "Sweet Crumbs Bakery",
  "progressLabels": ["Slice", "Frost", "Compare"],
  "welcome": "BakeryWelcome",
  "completion": "BakeryCompletion",
  "activities": [
    { "id": "scene1", "component": "BakeryScene1" },
    { "id": "scene2", "component": "BakeryScene2" },
    { "id": "scene3", "component": "BakeryScene3" }
  ]
}
```

Adding a 4th bakery activity becomes: append one entry to `activities` + one label to `progressLabels`. No `Index.tsx` edits, no `Stage` union edits.

## Component registry

`src/content/lessons/registry.ts` — single map from string id → lazy component, so JSON stays string-typed but loading stays code-split:

```ts
export const COMPONENTS = {
  BakeryWelcome: lazy(() => import("@/components/BakeryWelcome")),
  BakeryScene1:  lazy(() => import("@/components/BakeryScene1")),
  // … all welcomes, scenes, completions
} as const;
export type ComponentId = keyof typeof COMPONENTS;
```

Every scene/welcome/completion already exposes the same prop shape (`onComplete` / `onStart` / `onRestart` + `onReplayScene`), so the runner can call them generically.

## LessonRunner component

`src/components/LessonRunner.tsx`:

- Props: `lesson` (typed lesson JSON), `onExit` (back to town), `initialStage?` (for session restore).
- Internal state: `stage: "welcome" | { activityIdx: number } | "complete"`.
- Renders the shared chrome currently in `Index.tsx`: skip-link, `<main>`, Map alert dialog, `ProgressBar`, `SceneErrorBoundary` + `Suspense`, `MiniCalculator`, `KeyboardShortcutsHint`.
- Looks up components via the registry; renders welcome → activities[i] → activities[i+1] → completion.
- `onComplete` of the last activity → `markShopCompleted(lesson.id)` then advance to completion stage.
- `onReplayScene(id)` on the completion screen → look up `activities.findIndex(a => a.id === id)` and jump back.
- Persists `{ lessonId, stage }` to sessionStorage (replaces today's `SCREEN_STORAGE_KEY` schema, migrated transparently — unknown shapes fall back to town).

## Index.tsx after the refactor

Becomes ~40 lines:

```tsx
const LESSONS = { smoothie, bakery, bookstore }; // imported JSON
// town view unchanged
// shop view: <LessonRunner lesson={LESSONS[shop]} onExit={goToTown} />
```

All three per-shop JSX blocks, the `Stage` union, `stageIndex`, `VALID_STAGES`, and `SHOP_PROGRESS_LABELS` move into / are derived from the lesson JSON.

## Per-activity completion tracking

Today `progress.ts` tracks shop-level completion only (`markShopCompleted`). The runner already knows `(lessonId, activityId)` at the moment of completion, so we add:

```ts
markActivityCompleted(lessonId, activityId)
isActivityCompleted(lessonId, activityId)
getCompletedActivities(lessonId): string[]
```

Stored under a new `shesolves:activities` localStorage key (a `Record<lessonId, string[]>`). Not yet surfaced in UI — this is just the data foundation so a future "resume where you left off" or per-skill dashboard is trivial.

## Verification

- Vitest run.
- Manual smoke: walk each of the 3 shops welcome → 3 scenes → completion → Revisit a scene → Back to town. Confirm the Map alert, progress bar labels, calculator, and keyboard hints still appear.
- Reload mid-scene; confirm session restore lands on the same activity.
- Run `tests/a11y-all-shops.spec.ts` — no new violations (chrome is the same, just rendered by the runner).

## Technical notes

- Lesson JSON is fully static and tree-shakeable; no dynamic `import()` of JSON, just `import bakery from "@/content/lessons/bakery.json"`.
- Type the JSON with `import type { Lesson } from "./types"` + a `satisfies Lesson` at the import site for compile-time validation without runtime cost.
- The registry pattern keeps string-typed JSON but gives a `ComponentId` union for the lesson type, so a typo in `"BakeryScene4"` before the registry entry exists fails typecheck.
- No changes to scene components, templates, or content JSON — this step is purely the orchestration layer.

## Out of scope

- Per-activity progress UI (data only, no display).
- Schema validation (zod). Type narrowing at import time is enough for now.
- Authoring UI / DB-backed lessons.
- Cross-lesson navigation (the town map still owns shop selection).
