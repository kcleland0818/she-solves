## Change

In `src/components/CompletionScreen.tsx`, insert a `<SkillStamp />` row above the existing skill cards list, matching the Bakery and Bookstore pattern.

```tsx
import SkillStamp from "./SkillStamp";

// ...after the MayaSpeech block, before the skill cards list:
<div className="flex flex-wrap justify-center gap-2">
  {skills.map((s) => (
    <SkillStamp key={s.title} label={s.title} />
  ))}
</div>
```

Labels come from the existing `skills` array: **Ratios**, **Percentages**, **Discounts**.

## Files touched
- edit: `src/components/CompletionScreen.tsx`

## Out of scope
No copy changes, no layout changes to the cards themselves, no new component.
