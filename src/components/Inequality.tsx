/**
 * Renders an inequality symbol (<, >, ≤, ≥, =) styled as a tappable "pill"
 * — soft primary-tinted background + dotted underline — that signals it's
 * a defined term you can interact with, without inserting an extra "?"
 * character that would visually pollute the math expression.
 *
 * Tap / click / Enter / focus opens a Popover with the plain-English name
 * and a memory tip. Uses Popover (not Tooltip) so it works on touch.
 *
 * Accessibility: aria-label spells out the spoken phrase + hint affordance,
 * since assistive tech often skips or mispronounces raw < and > glyphs.
 */
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type InequalityOp = "lt" | "gt" | "lte" | "gte" | "eq";

const SYMBOL: Record<InequalityOp, string> = {
  lt: "<",
  gt: ">",
  lte: "≤",
  gte: "≥",
  eq: "=",
};

const LABEL: Record<InequalityOp, string> = {
  lt: "less than",
  gt: "greater than",
  lte: "less than or equal to",
  gte: "greater than or equal to",
  eq: "equals",
};

const MEMORY_TIP: Partial<Record<InequalityOp, string>> = {
  lt: "The small point ( < ) points to the smaller number.",
  gt: "The small point ( > ) points to the smaller number.",
  lte: "Like < but the line under it means it can also be equal.",
  gte: "Like > but the line under it means it can also be equal.",
};

interface InequalityProps {
  op: InequalityOp;
  className?: string;
}

const Inequality = ({ op, className }: InequalityProps) => {
  const [open, setOpen] = useState(false);
  const label = LABEL[op];
  const tip = MEMORY_TIP[op];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label} — tap for hint`}
          className={cn(
            "inline-flex items-center justify-center align-baseline font-semibold cursor-help",
            "px-1.5 rounded-md bg-primary/15 text-foreground ring-1 ring-primary/30",
            "underline decoration-dotted decoration-primary underline-offset-4",
            "dark:bg-primary/25 dark:ring-primary/60",
            "hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          {SYMBOL[op]}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 text-sm" side="top" align="center">
        <p className="font-semibold text-foreground">
          <span aria-hidden="true" className="mr-1">{SYMBOL[op]}</span>
          means "{label}"
        </p>
        {tip && <p className="mt-1 text-xs text-muted-foreground">{tip}</p>}
      </PopoverContent>
    </Popover>
  );
};

export default Inequality;
