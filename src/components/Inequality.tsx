/**
 * Renders an inequality symbol (<, >, ≤, ≥, =) with its plain-English name
 * available on hover, focus, or long-press. The symbol stays visually clean
 * for learners who've locked it in, while anyone who's still shaky on
 * which-way-is-which can hover (or tab to it) and see "less than".
 *
 * Implementation notes:
 * - Uses native `title` for hover + long-press on touch devices (free,
 *   zero-JS, works everywhere).
 * - Adds a visible underline-dotted cue so learners know it's interactive.
 * - tabIndex=0 + aria-label so keyboard users can focus it and screen
 *   readers announce the spoken phrase instead of the raw character.
 */
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

interface InequalityProps {
  op: InequalityOp;
  className?: string;
}

const Inequality = ({ op, className }: InequalityProps) => {
  const label = LABEL[op];
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      tabIndex={0}
      className={cn(
        "font-semibold cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {SYMBOL[op]}
    </span>
  );
};

export default Inequality;
