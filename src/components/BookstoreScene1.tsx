import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";
import Inequality, { InequalityOp } from "./Inequality";

interface Scene1Props {
  onComplete: () => void;
}

// Read: given two book facts, pick the symbol that makes the statement true.
type Problem = {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  unit: string;
  // Allowed correct ops — usually one, but = could be two valid (lt+lte) etc.
  // We'll just compute the strict op (lt/gt/eq) as the correct answer.
};

const PROBLEMS: Problem[] = [
  { leftLabel: "Picture book", leftValue: 24, rightLabel: "Chapter book", rightValue: 110, unit: "pages" },
  { leftLabel: "Mystery", leftValue: 248, rightLabel: "Fantasy", rightValue: 248, unit: "pages" },
  { leftLabel: "Hardcover price", leftValue: 22, rightLabel: "Paperback price", rightValue: 14, unit: "dollars" },
  { leftLabel: "Cookbook", leftValue: 180, rightLabel: "Travel guide", rightValue: 96, unit: "pages" },
  { leftLabel: "New release", leftValue: 18, rightLabel: "Used copy", rightValue: 18, unit: "dollars" },
  { leftLabel: "Sci-fi", leftValue: 312, rightLabel: "Biography", rightValue: 420, unit: "pages" },
];

const correctOp = (a: number, b: number): InequalityOp =>
  a < b ? "lt" : a > b ? "gt" : "eq";

const OPTIONS: InequalityOp[] = ["lt", "gt", "eq"];

const SYMBOL_TEXT: Record<InequalityOp, string> = {
  lt: "<", gt: ">", eq: "=", lte: "≤", gte: "≥",
};

const BookstoreScene1 = ({ onComplete }: Scene1Props) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<InequalityOp | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const problem = PROBLEMS[idx];
  const answer = useMemo(() => correctOp(problem.leftValue, problem.rightValue), [problem]);
  const isCorrect = picked === answer;
  const allDone = solved.size === PROBLEMS.length;

  const submit = (op: InequalityOp) => {
    setPicked(op);
    if (op === answer) {
      setSolved((s) => new Set(s).add(idx));
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => (i + 1) % PROBLEMS.length);
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="bookstore-scene1-heading">
      <h2 id="bookstore-scene1-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">📖 </span>Read the Symbol
      </h2>

      <AverySpeech>
        Tap a symbol to read this comparison aloud. <Inequality op="lt" /> means "less than",{" "}
        <Inequality op="gt" /> means "greater than", and <Inequality op="eq" /> means "equal".
        Pick the one that makes the sentence true!
      </AverySpeech>

      <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 shadow-sm">
        <p className="text-center text-sm text-muted-foreground mb-2">
          Problem {idx + 1} of {PROBLEMS.length} · solved {solved.size}/{PROBLEMS.length}
        </p>
        <div className="flex items-center justify-center gap-3 text-foreground flex-wrap">
          <div className="text-center">
            <div className="font-semibold">{problem.leftLabel}</div>
            <div className="text-2xl font-extrabold">{problem.leftValue}</div>
            <div className="text-xs text-muted-foreground">{problem.unit}</div>
          </div>
          <div
            className="text-3xl font-bold w-12 h-12 rounded-lg flex items-center justify-center bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground border-2 border-dashed border-bookstore-leather/40"
            aria-label={picked ? `picked ${SYMBOL_TEXT[picked]}` : "missing symbol"}
          >
            {picked ? SYMBOL_TEXT[picked] : "?"}
          </div>
          <div className="text-center">
            <div className="font-semibold">{problem.rightLabel}</div>
            <div className="text-2xl font-extrabold">{problem.rightValue}</div>
            <div className="text-xs text-muted-foreground">{problem.unit}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-center" role="group" aria-label="Choose a comparison symbol">
        {OPTIONS.map((op) => (
          <Button
            key={op}
            type="button"
            variant={picked === op ? "default" : "outline"}
            onClick={() => submit(op)}
            className="text-2xl font-bold w-16 h-14"
            aria-label={`Pick ${op === "lt" ? "less than" : op === "gt" ? "greater than" : "equals"}`}
          >
            {SYMBOL_TEXT[op]}
          </Button>
        ))}
      </div>

      {picked && (
        <p className="text-center font-medium text-sm" role="status" aria-live="polite">
          {isCorrect
            ? `Yes! ${problem.leftValue} ${SYMBOL_TEXT[answer]} ${problem.rightValue} — ${problem.leftLabel.toLowerCase()} is ${answer === "lt" ? "less than" : answer === "gt" ? "greater than" : "equal to"} ${problem.rightLabel.toLowerCase()}.`
            : `Not quite. Compare the numbers ${problem.leftValue} and ${problem.rightValue} again.`}
        </p>
      )}

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
    </section>
  );
};

export default BookstoreScene1;
