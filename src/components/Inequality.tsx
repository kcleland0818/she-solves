/**
 * Renders an inequality symbol (<, >, ≤, ≥, =) alongside its plain-English
 * name so learners who haven't yet locked in the symbol can still follow
 * along. The symbol stays visually prominent; the label is smaller and
 * muted so it reads as a hint, not as part of the math.
 *
 * Accessibility: screen readers announce only the spoken phrase
 * (e.g. "less than") instead of the raw character, which assistive tech
 * often skips or mispronounces.
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
  /** Hide the "(less than)" hint label — symbol-only with a11y text preserved. */
  hideLabel?: boolean;
  className?: string;
}

const Inequality = ({ op, hideLabel = false, className }: InequalityProps) => {
  return (
    <span className={cn("inline-flex items-baseline gap-1 whitespace-nowrap", className)}>
      <span aria-hidden="true" className="font-semibold">
        {SYMBOL[op]}
      </span>
      {!hideLabel && (
        <span aria-hidden="true" className="text-xs text-muted-foreground">
          ({LABEL[op]})
        </span>
      )}
      <span className="sr-only">{LABEL[op]}</span>
    </span>
  );
};

export default Inequality;
