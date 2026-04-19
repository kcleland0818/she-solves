
Looking at `Scene2Percentages.tsx`, the four flavor buttons under the pie chart are styled as full bordered cards in a 2-column grid. They serve two purposes:

1. **Keyboard/screen-reader users** — they're the accessible way to explore the data (the pie itself is `aria-hidden`).
2. **Mouse/touch users** — they act as a clickable legend.

The user finds the rectangle outlines visually heavy, especially on mobile where the pie + 4 cards stack into a tall block.

A few things to note:
- They ARE relevant on mobile too — touch users tap them to see "X of Y smoothies" details, since the pie chart's onClick is awkward on small slices. So we shouldn't *hide* them on mobile, just make them lighter.
- The current selected state uses `border-primary bg-primary/10 shadow-sm scale-[1.02]` which is fine — selection should stay obvious.
- The unselected state is what feels heavy: `border-border bg-card`.

### Proposed approach

Make the **unselected** legend items visually lighter while keeping them fully functional and accessible:

- Drop the persistent border + card background on unselected items → use a transparent background with no border (or a very subtle bottom hairline only).
- Keep the colored dot, emoji, and label — these carry the meaning.
- On hover/focus, gently reveal a subtle background (`hover:bg-muted/40`) so it still feels tappable.
- Keep the **selected** state visually strong (border + tint + scale) so the active choice is unmistakable.
- Focus ring stays as-is for keyboard users (WCAG requirement).

This keeps the screen-reader experience identical (same buttons, same labels, same `aria-pressed`) while making the visual presentation much calmer — on both desktop and mobile.

### File to change

- `src/components/Scene2Percentages.tsx` — adjust the className on the legend `<button>` (lines ~135-143). One-line tweak, no logic changes.

### Before / after (unselected state)

```text
Before:  [ • 🍓 Strawberry        ]   ← bordered card
After:     • 🍓 Strawberry            ← borderless, transparent, hover-reveals
```

Selected state remains visually prominent and unchanged.
