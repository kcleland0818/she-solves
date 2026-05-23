# Scaling SheSolves — World + Lesson Engine

## The current ceiling

Today every scene (e.g. `BakeryScene1`, `Scene1Ratios`, `BookstoreScene1`) is a **bespoke React component** with hardcoded `challenges` arrays and a one-off interaction (slider, pie slices, true/false). Three shops × 3 scenes = 9 hand-built components. Adding lesson #10 means writing TSX. That's the scaling wall.

There are really **two** scaling problems hiding in one question:

1. **World scale** — what happens when the town runs out of room?
2. **Lesson scale** — how do we ship 50 → 500 lessons without hand-crafting each?

---

## Part 1 — Scaling the world beyond one town

A flat map of clickable buildings stops working around ~8 shops (visual clutter, no progression, no theming).

Evolution path:

```text
Stage 1 (today)        Stage 2                 Stage 3                  Stage 4
-----------------      -----------------       --------------------     ----------------
Single Town            Town + Districts        World Map of Cities      Worlds / Realms
3 shops                ~12 shops grouped       Each city = a strand     Cities grouped by
                       by topic district       (Numbers City,           grade band or
                                               Geometry Harbor,         theme (Elementary
                                               Algebra Heights…)        World, Middle World)
```

Concrete mechanics:
- **Districts inside the town** (Stage 2): zoom/pan, or tabs (Food Court, Main Street, Park). Each district groups 3–6 shops by topic family. Cheapest next step — reuses the existing map metaphor.
- **City overview → enter city → see shops** (Stage 3): the current `TownMap` becomes a *city view*. A new top-level `WorldMap` lists cities. Each city is a coherent math strand (Fractions Town, Ratio City, Inequality Harbor).
- **Quests / paths** (cross-cutting): linear shop ordering inside a city, unlocked progressively. Solves "where do I go next?" once there are too many shops to scan.
- **Search / lesson library view**: parallel to the map, a flat searchable list ("I want to practice equivalent fractions") for older / returning learners who don't want the game framing.

UI implication: the map metaphor doesn't have to die — it just becomes one navigation surface among several (map, search, "continue where you left off", daily mission).

---

## Part 2 — The Lesson Engine (the real scaling lever)

Today: scene = code. Goal: scene = **data interpreted by a small set of reusable interaction components**.

### The model

Three layers, smallest to largest:

```text
┌────────────────────────────────────────────────────────┐
│  Curriculum  ── ordered list of Skills (a strand)      │
│     └── Skill  ── a single learning objective           │
│           └── Lesson  ── one play session (~3–7 min)    │
│                 └── Activity  ── one screen of practice │
│                       └── uses an Interaction Template  │
└────────────────────────────────────────────────────────┘
```

An **Interaction Template** is a generic, parameterized React component. Examples derived from what already exists:

| Template            | Generalized from        | Parameters                                       |
| ------------------- | ----------------------- | ------------------------------------------------ |
| `SlicePicker`       | `BakeryScene1`          | denominator options, target numerator, theme     |
| `RatioMixer`        | `Scene1Ratios`          | ingredients, target ratio, min total             |
| `TrueFalseStatement`| `BookstoreScene1`       | left value, op, right value, units               |
| `MultipleChoice`    | (new, covers many)      | prompt, options, correct index, hint             |
| `NumberInput`       | (new)                   | prompt, evaluator, tolerance                     |
| `DragToBucket`      | (new)                   | items, buckets, correct mapping                  |
| `NumberLinePlace`   | (new)                   | range, target value, tolerance                   |

10–15 templates cover the vast majority of K–8 math practice. Each template is built **once**, well, with accessibility and theming baked in.

### Lesson = JSON (or DB row)

```json
{
  "id": "fractions.identify.basic-sixths",
  "skill": "identifying-fractions",
  "character": "penny",
  "shop": "bakery",
  "activities": [
    { "template": "SlicePicker", "params": { "denominator": 6, "target": 5 } },
    { "template": "SlicePicker", "params": { "denominator": 8, "target": 3 } },
    { "template": "MultipleChoice", "params": {
        "prompt": "Which is 1/3?",
        "options": ["1 of 3", "3 of 1", "1 of 2"], "correct": 0
    }}
  ]
}
```

This is the unlock. New lesson = new JSON row, no deploy of code.

### Where lessons come from

Tiered authoring, cheapest to most rigorous:

1. **Procedural generators** — for skills that are pure parameter spaces (fraction naming, ratio scaling, integer comparison). One function generates infinite drilled variants with difficulty knobs.
2. **AI-assisted authoring** — a Lovable AI prompt that takes `{skill, difficulty, character, shop theme}` and outputs a candidate lesson JSON + word-problem flavor text. Human reviews and approves.
3. **Curriculum-team handcrafted** — for the polished, story-driven "anchor" lessons that introduce a new skill. These are the ones worth a human's time.

A reasonable mix: ~70% generated, ~20% AI-drafted-then-edited, ~10% handcrafted.

### Where lessons live

Lovable Cloud (Postgres) is the natural home once content > what's comfortable in a repo:

- `skills`, `lessons`, `activities` tables
- `user_progress` per learner per activity (current localStorage `completedShops` graduates here)
- Authoring UI is a separate internal route protected by a role (`curriculum_author`)

Stays as static JSON files in the repo until ~50 lessons; migrate to DB when authoring throughput justifies it.

---

## Part 3 — Migration path (incremental, not a rewrite)

You don't rip out what works. Order of operations:

1. **Extract one template.** Turn `BakeryScene1` into `SlicePicker` driven by a `challenges` prop. The bakery still works; nothing else changes.
2. **Repeat for the other 8 scenes.** End state: ~6–8 templates, every existing scene is a thin wrapper that passes hardcoded data into a template.
3. **Move challenge data from `.tsx` arrays to `.json` files** under `src/content/`. Scenes become 5-line files that import JSON.
4. **Build a lesson runner.** Single component that takes a lesson ID, loads its JSON, walks the activities, tracks per-activity completion, hands off to the next.
5. **Add one procedural generator** (e.g. fraction-identification) and prove it can produce 20 valid lessons from one function.
6. **Move to DB** when handcrafted + generated content exceeds ~50 lessons, or when non-engineers need to author.
7. **Introduce city/district navigation** once the lesson library is big enough that the flat map feels cramped.

Each step ships value on its own. Step 1 alone makes the next bakery lesson a 30-second JSON edit instead of a new component.

---

## Technical section (for the curious)

- **Template contract**: every template exports `({ params, onComplete, onProgress }) => JSX`. The runner doesn't care what's inside.
- **Theming per shop**: pass a `theme` token (`bakery`, `bookstore`, `smoothie`) into the template; templates read `hsl(var(--{theme}-*))` tokens that already exist in `index.css`. No template hardcodes colors.
- **Characters as data**: Penny/Maya/Avery become a `{ name, avatar, speechComponent }` record. New character = new row, not new component.
- **Progress schema**: `completedShops` Set in localStorage → `user_progress(user_id, activity_id, completed_at, attempts, hints_used)` in Postgres. The `progress.ts` API stays similar so callers don't churn.
- **Procedural generators** live in `src/lib/generators/{skill}.ts`, each exporting `generate(seed, difficulty) → LessonJSON`. Pure functions, easy to test.
- **AI authoring** uses Lovable AI Gateway via an edge function with structured tool-calling output (schema = the Lesson JSON shape). Never client-side.

---

## What I'd recommend doing first

The highest-leverage single move right now is **Step 1**: extract `BakeryScene1` into a `SlicePicker` template and prove that adding a 4th, 5th, 6th bakery activity is a JSON edit. That one refactor de-risks the entire engine direction without committing to a database, authoring UI, or world-map redesign yet.

Want me to do that as the next concrete change?
