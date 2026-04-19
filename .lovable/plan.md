
You're right — let me re-read the current code carefully.

Looking at `Scene2Percentages.tsx` lines 135-143 (the legend buttons):

```tsx
className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
  isActive
    ? "bg-primary/15 ring-2 ring-primary/40 shadow-md scale-[1.04]"
    : "bg-transparent"
}`}
```

So the current state is:
- **Unselected** = `bg-transparent` → no border, no background. Just the dot + emoji + label.
- **Selected** = `bg-primary/15 ring-2 ring-primary/40 shadow-md scale-[1.04]` → tinted background + a **ring** (which is a Tailwind outline-style ring, not a `border`) + shadow + slight scale-up.

### What you're actually seeing

That `ring-2 ring-primary/40` on the selected item **is the "rectangle"** you're seeing around the highlighted flavor. A Tailwind `ring` renders visually as a rounded outline hugging the button's shape — it looks just like a border box.

So when you click Strawberry, Strawberry gets that ring outline. The other three stay completely clean (no border, no background). That matches your session replay: you tap Mango → Mango gets the outline, others are bare. Tap Strawberry → outline jumps to Strawberry.

### The real question

I think what you're asking now is: **"Can the selected flavor pop without that ring outline at all?"** — i.e., rely purely on the tint + shadow + scale, no rectangular outline hugging it.

Yes, that's doable and still ADA-compliant, because we'd still have **three** non-color cues for the selected state:
1. Background tint (`bg-primary/15`)
2. Shadow (`shadow-md`)
3. Scale-up (`scale-[1.04]`)
4. `aria-pressed="true"` for screen readers

We can also bump the tint a bit (e.g. `bg-primary/20`) and the scale (`scale-110`) so it pops more without needing the ring.

The keyboard focus ring (`focus-visible:ring-2 ring-ring`) stays — that's separate and only appears while Tab-focused.

### Proposed change

In `src/components/Scene2Percentages.tsx`, change the active-state classes from:

```
bg-primary/15 ring-2 ring-primary/40 shadow-md scale-[1.04]
```

to:

```
bg-primary/20 shadow-md scale-110
```

That removes the ring outline (the "rectangle") entirely while making the selected flavor pop a bit more via stronger tint and bigger scale.

### File to change

- `src/components/Scene2Percentages.tsx` — single className tweak on lines 138-140. No logic changes, no a11y regression.
