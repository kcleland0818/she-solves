/**
 * Renders an inequality symbol (<, >, ≤, ≥, =) with a visible "?" badge
 * that learners can hover, tap, or focus to reveal the plain-English name
 * ("less than", "greater than", etc.).
 *
 * Uses Popover (not Tooltip) so a single tap on touch devices opens it —
 * Radix Tooltip only opens on hover/focus, which fails on phones.
 *
 * Accessibility: the trigger button has an aria-label with the spoken
 * phrase, so screen readers announce e.g. "less than, hint" instead of
 * the raw character (which assistive tech often skips or mispronounces).
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
            "group relative inline-flex items-center font-semibold cursor-help align-baseline",
            "rounded-sm px-0.5 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <span aria-hidden="true">{SYMBOL[op]}</span>
          <span
            aria-hidden="true"
            className="ml-0.5 inline-flex items-center justify-center text-[0.6em] font-bold w-3.5 h-3.5 rounded-full bg-primary/20 text-primary -translate-y-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            ?
          </span>
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
