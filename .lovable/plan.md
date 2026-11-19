# Lucky Stars Arcade — Probability Shop

A 4th shop on the town map where students run an arcade prize booth and learn probability. Built on the existing lesson engine: one lesson JSON, three activities, a practice mode, and the same welcome / celebration / skill-stamp / completion flow as the other shops. Works offline like the rest of the app.

## What students do

**Welcome** — Meet the arcade owner, who hands over the prize booth for the day.

**Activity 1: Spin the Wheel (probability as a fraction)**
- Explore: a prize wheel with colored sections; students spin a few times and see results.
- Challenge: "What's the chance of landing on gold?" — answer as a fraction (e.g. 2/8), then simplify.
- Skill: Probability of a Single Event.

**Activity 2: Prize Bags (likely vs. unlikely)**
- Explore: bags of colored tokens.
- Challenge: place events on a scale — Impossible, Unlikely, Even chance, Likely, Certain — and pick which bag gives the best chance at a prize.
- Skill: Comparing Likelihood.

**Activity 3: Claw Machine Forecast (predicting outcomes)**
- Explore: a claw machine with a mix of plushies.
- Challenge: "If you play 20 times, about how many unicorns will you win?" — then run a simulated 20 plays and compare the prediction with what actually happened (experimental vs. expected).
- Skill: Predicting With Probability.

**Practice mode** — Fresh spinners and prize bags each round from a seeded generator, with the same round counter and "New challenge" button as the Bakery.

**Completion** — Skill stamps, earned skills appear in the trophy dashboard.

## Map
- New marker "Lucky Stars Arcade" with emoji, description, and the three topics, placed so it doesn't overlap existing shops on phone or desktop.

## Technical details
- `src/content/lessons/arcade.json` (id `arcade`, progressLabels Spin / Bags / Claw, theme-safe bg).
- New reusable templates in `src/components/templates/`: `SpinnerProbability`, `LikelihoodScale`, `PredictionSimulator`, each driven by `src/content/arcade/scene1-3.json`.
- Thin wrappers `ArcadeWelcome`, `ArcadeScene1-3`, `ArcadeCompletion`, `ArcadePractice`; register in `registry.ts`; shop entry in `TownMap.tsx`; skills added to `SkillsDashboard` and `celebrate.ts`.
- Generator `src/content/generators/probability.ts` (mulberry32-seeded) producing spinner/bag problems with simplified-fraction answers; vitest proving 20 valid problems and correct answers.
- Simulation in Activity 3 uses seeded randomness so tests are deterministic.
- Keyboard-operable everything, 44px tap targets, semantic tokens only; extend `a11y-all-shops.spec.ts` to walk the arcade; confirm it loads offline.
