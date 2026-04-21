## Berry Bliss audit — what could still be polished

The Berry Bliss experience is solid: 3 scenes, randomized challenges, hints, a mini calculator, keyboard shortcuts, accessible markup, town map entry, and a celebratory completion screen. Before we open Sweet Crumbs, here are the gaps I noticed — none are blockers, all are optional polish.

### Higher-impact ideas (pick what resonates)

1. **Progress persistence** — If a learner refreshes mid-lesson, they restart from the town map. We could remember which scene they're on (and even mark Berry Bliss as "completed" on the town map with a checkmark badge).
2. **"Completed" state on the town map** — Once a learner finishes Berry Bliss, the smoothie marker could show a gold star or checkmark instead of just being unlocked. Sets up nicely for a multi-shop progress system.
3. **Replay individual scenes** — Right now from the completion screen the only path back is "Play Again" (full restart) or the town map. A "Revisit a scene" picker (Ratios / Percentages / Discounts) would help kids review one concept.
4. **Sound / haptic feedback (opt-in)** — A soft chime on a correct answer and a gentle buzz on mobile for slider milestones. Would need a mute toggle and respect `prefers-reduced-motion` siblings.
5. **Score / streak tracker** — Lightweight count of challenges completed per scene shown in the progress bar (e.g., "2 of 3 ratio challenges solved"). Encourages trying multiple variants instead of clicking "Next" right away.

### Smaller polish items

6. **Scene 2 — show the answer percentage on the pie/legend after a correct answer.** Right now Maya tells you the % verbally, but the chart/legend never displays the number. A small "≈ 40%" badge on the active legend item once `phase === "done"` would reinforce the lesson.
7. **Scene 3 — quick-pick discount chips (10%, 25%, 50%)** in addition to the slider. Mental-math discounts are easier to discover when the common ones are one tap away. Slider stays for fine-grained exploration.
8. **Welcome screen reachability** — Currently you only see the welcome screen the first time you enter the shop. After completion, "Play Again" goes to the town map and re-entering the shop shows welcome again, which is fine — but we could add a "Skip intro" memory so returning learners jump straight to Scene 1.
9. **Town map — "Last visited" indicator** so a returning learner immediately sees where they left off.
10. **Maya variety** — Maya's speech is static per phase. A small pool of 2–3 phrasings per moment (randomly chosen) would make repeat playthroughs feel less scripted.

### My recommendation

If the goal is to launch Sweet Crumbs as part of a **growing town**, I'd do these two first because they pay off across every future shop:

- **#2 Town map "completed" state** (visual reward + sets the multi-shop pattern)
- **#3 Replay individual scenes** from the completion screen (better learning loop)
- #8 Welcome screen reachability

Everything else can wait until after Sweet Crumbs ships, or skip entirely.

### What I'd skip for now

- Sound/haptics (scope creep, needs settings UI)
- Score/streak (adds pressure; current free-exploration tone is nice)
- Maya variety (nice-to-have, not load-bearing)

Tell me which (if any) you'd like to add before we head to Sweet Crumbs — or say "none, let's go to Sweet Crumbs" and we'll move on.