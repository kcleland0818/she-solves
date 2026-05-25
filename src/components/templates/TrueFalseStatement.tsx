import { useState, useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "@/components/AverySpeech";
import SkillStamp from "@/components/SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import Inequality, { type InequalityOp } from "@/components/Inequality";

export interface TFProblem {
  leftTitle: string;
  leftEmoji: string;
  leftValue: number;
  rightTitle: string;
  rightEmoji: string;
  rightValue: number;
  unit: string;
  unitSymbol: string;
  shownOp: InequalityOp;
}

export interface TrueFalseStatementProps {
  problems: TFProblem[];
  skillLabel: string;
  onComplete: () => void;
  heading?: string;
  /** Optional intro speech; falls back to default inequality tutorial. */
  intro?: ReactNode;
  /** Theme key passed to celebratoryOpener. */
  shopTheme?: "bookstore" | "bakery" | "smoothie";
}

const SYM: Record<InequalityOp, string> = { lt: "<", gt: ">", eq: "=", lte: "≤", gte: "≥" };
const SPOKEN: Record<InequalityOp, string> = {
  lt: "less than",
  gt: "greater than",
  eq: "equal to",
  lte: "less than or equal to",
  gte: "greater than or equal to",
};

const evalOp = (a: number, op: InequalityOp, b: number) => {
  switch (op) {
    case "lt": return a < b;
    case "gt": return a > b;
    case "eq": return a === b;
    case "lte": return a <= b;
    case "gte": return a >= b;
  }
};

const BookCover = ({ emoji, title, value, unitSymbol, unit }: { emoji: string; title: string; value: number; unitSymbol: string; unit: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-md bg-gradient-to-br from-bookstore-leather to-bookstore-leather-deep shadow-md flex items-center justify-center text-4xl sm:text-5xl border-r-4 border-bookstore-leather-deep" aria-hidden="true">
      {emoji}
    </div>
    <div className="mt-2 text-center">
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xl font-extrabold">{unitSymbol}{value}</div>
      <div className="text-[11px] text-muted-foreground">{unit}</div>
    </div>
  </div>
);

const defaultIntro = (
  <>
    Tap a symbol to hear what it means: <Inequality op="lt" /> is "less than",{" "}
    <Inequality op="gt" /> is "greater than", <Inequality op="eq" /> is "equal".
    Trick: the small point of <Inequality op="lt" /> or <Inequality op="gt" /> always points to
    the <em>smaller</em> number. Read the shelf tag and tell me — true or false?
  </>
);

/**
 * Generic "render a statement, judge true/false" template. Data-driven via
 * a `problems` array — adding a new statement-judgement lesson is JSON, not TSX.
 */
const TrueFalseStatement = ({
  problems,
  skillLabel,
  onComplete,
  heading = "📖 Read & Check",
  intro,
  shopTheme = "bookstore",
}: TrueFalseStatementProps) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"true" | "false" | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const problem = problems[idx];
  const truth = useMemo(() => evalOp(problem.leftValue, problem.shownOp, problem.rightValue), [problem]);
  const isCorrect = picked !== null && (picked === "true") === truth;
  const allDone = solved.size === problems.length;

  const submit = (choice: "true" | "false") => {
    setPicked(choice);
    if ((choice === "true") === truth) {
      setSolved((s) => new Set(s).add(idx));
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => (i + 1) % problems.length);
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full" aria-labelledby="tf-statement-heading">
      <h2 id="tf-statement-heading" className="text-2xl font-bold text-center">{heading}</h2>

      <AverySpeech>{intro ?? defaultIntro}</AverySpeech>

      <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 shadow-sm">
        <p className="text-center text-sm text-muted-foreground mb-3">
          Statement {idx + 1} of {problems.length} · solved {solved.size}/{problems.length}
        </p>
        <div className="flex items-end justify-center gap-3 sm:gap-5 flex-wrap">
          <BookCover emoji={problem.leftEmoji} title={problem.leftTitle} value={problem.leftValue} unitSymbol={problem.unitSymbol} unit={problem.unit} />
          <div className="text-4xl sm:text-5xl font-extrabold leading-none text-bookstore-leather-deep dark:text-bookstore-gold" aria-label={`is ${SPOKEN[problem.shownOp]}`}>
            {SYM[problem.shownOp]}
          </div>
          <BookCover emoji={problem.rightEmoji} title={problem.rightTitle} value={problem.rightValue} unitSymbol={problem.unitSymbol} unit={problem.unit} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3 italic">
          "{problem.unitSymbol}{problem.leftValue} {SYM[problem.shownOp]} {problem.unitSymbol}{problem.rightValue}"
        </p>
      </div>

      <div className="flex gap-3 justify-center" role="group" aria-label="True or false">
        <Button type="button" variant={picked === "true" ? "default" : "outline"} onClick={() => submit("true")} className="text-base font-bold w-28 h-12">
          <span aria-hidden="true">✓ </span>True
        </Button>
        <Button type="button" variant={picked === "false" ? "default" : "outline"} onClick={() => submit("false")} className="text-base font-bold w-28 h-12">
          <span aria-hidden="true">✗ </span>False
        </Button>
      </div>

      {picked && (
        <p className="text-center font-medium text-sm" role="status" aria-live="polite">
          {isCorrect
            ? `${celebratoryOpener(shopTheme)} ${problem.unitSymbol}${problem.leftValue} ${SYM[problem.shownOp]} ${problem.unitSymbol}${problem.rightValue} is ${truth ? "true" : "false"}. ${skillBeat(skillLabel.toLowerCase())}`
            : `Not quite — read the numbers again: ${problem.unitSymbol}${problem.leftValue} and ${problem.unitSymbol}${problem.rightValue}.`}
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        {allDone && <SkillStamp label={skillLabel} />}
        <div className="flex gap-3 justify-center flex-wrap">
          {picked && !isCorrect && (
            <Button variant="outline" onClick={() => setPicked(null)}>Try again</Button>
          )}
          {isCorrect && !allDone && (
            <Button onClick={next} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
              Next book <span aria-hidden="true">→</span>
            </Button>
          )}
          {allDone && (
            <Button onClick={onComplete} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
              On to writing! <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrueFalseStatement;
