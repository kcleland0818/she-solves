## Problem

In Bakery Scene 3's explore phase, Penny says things like:

> 8 `<`? 9, so 2/3 wins.

The superscript `?` badge sits right between two numbers, so it reads like an unknown operand: *"8 less than WHAT 9?"* That's the opposite of what we want — the `?` should clearly be a help affordance, not part of the math.

## Goal

Keep the popover-on-tap behavior (it's working well) and the helper line below Penny (also working), but redesign the trigger so it never looks like part of the expression.

## Proposed approach

Drop the inline `?` badge entirely. Instead, make the **symbol itself** the affordance:

- Wrap the `<` / `>` in a subtle pill: soft primary-tinted background, dotted underline, slightly bolder weight.
- On hover/focus: pill brightens, cursor becomes `help`.
- On tap/click/Enter: same Popover opens with the plain-English name + memory tip.
- Keep `aria-label="less than — tap for hint"` so screen readers still announce it as interactive.

This way `8 < 9` reads cleanly as math, but the `<` visibly looks "different" from the surrounding numbers — like a defined term in an article (think Wikipedia's dotted-underline glossary links, or a hyperlink).

### Update the helper line to match

Current line says *"Tap any `<` or `>` with a `?` for a hint."* Since there's no more `?`, change it to:

> 💡 Not sure what a symbol means? Tap any **highlighted** `<` or `>` for a hint.

Where the two symbols in that sentence render with the same pill styling, so learners visually connect "this is the thing I tap."

### Files to change

1. **`src/components/Inequality.tsx`** — remove the `?` badge span; restyle the trigger button as a pill with primary-tinted background + dotted underline.
2. **`src/components/BakeryScene3.tsx`** — update the helper text below Penny so the inline `<` and `>` examples render via `<Inequality />` (they'll then visually match what learners see in the speech bubble).

### What stays the same

- Popover content (symbol + "means 'less than'" + memory tip).
- Touch/keyboard/screen-reader behavior.
- The `<Inequality op="..." />` API — no changes needed in `BakeryScene3.tsx` beyond the helper line.

## Visual sketch

```text
Before:  8 <? 9      ← reads as "8 less than what 9?"
After:   8 ⟦<⟧ 9     ← the < is a tappable pill, math reads cleanly
```

Where `⟦<⟧` = the `<` character on a soft primary background with a dotted underline, same height as surrounding text.

## Open question

If the pill alone still feels too subtle for first-time discovery, a fallback is to show a one-time toast or banner the first time a learner enters the explore phase: *"Tip: tap any `<` or `>` symbol to see what it means."* I'd suggest shipping the pill first and only adding the banner if it's still not getting noticed — happy to add it now if you'd rather be safe.