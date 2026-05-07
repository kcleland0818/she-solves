import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";
import Inequality, { InequalityOp } from "./Inequality";

interface Scene1Props {
  onComplete: () => void;
}

// READ: a fully-formed inequality statement is shown with two book covers
// and their values. Learner reads it and decides TRUE or FALSE.
type Problem = {
  leftTitle: string;
  leftEmoji: string;
  leftValue: number;
  rightTitle: string;
  rightEmoji: string;
  rightValue: number;
  unit: string;       // "pages" | "dollars"
  unitSymbol: string; // "" or "$"
  shownOp: InequalityOp;
};

const PROBLEMS: Problem[] = [
  { leftTitle: "Tiny Tales", leftEmoji: "📕", leftValue: 24, rightTitle: "Epic Quest", rightEmoji: "📗", rightValue: 410, unit: "pages", unitSymbol: "", shownOp: "lt" },
  { leftTitle: "Bake Book", leftEmoji: "📙", leftValue: 22, rightTitle: "Travel Log", rightEmoji: "📘", rightValue: 14, unit: "dollars", unitSymbol: "$", shownOp: "lt" }, // false
  { leftTitle: "Mystery", leftEmoji: "📕", leftValue: 248, rightTitle: "Sci-Fi", rightEmoji: "📗", rightValue: 248, unit: "pages", unitSymbol: "", shownOp: "eq" },
  { leftTitle: "Comic", leftEmoji: "📙", leftValue: 9, rightTitle: "Atlas", rightEmoji: "📘", rightValue: 35, unit: "dollars", unitSymbol: "$", shownOp: "gt" }, // false
  { leftTitle: "Cookbook", leftEmoji: "📕", leftValue: 180, rightTitle: "Poems", rightEmoji: "📗", rightValue: 96, unit: "pages", unitSymbol: "", shownOp: "gt" },
  { leftTitle: "Used", leftEmoji: "📙", leftValue: 12, rightTitle: "New", rightEmoji: "📘", rightValue: 18, unit: "dollars", unitSymbol: "$", shownOp: "lt" },
];

const SYM: Record<InequalityOp, string> = { lt: "<", gt: ">", eq: "=", lte: "≤", gte: "≥" };

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
      <div className="text-xl font-extrabold">
        {unitSymbol}{value}
      </div>
      <div className="text-[11px] text-muted-foreground">{unit}</div>
    </div>
  </div>
);

const BookstoreScene1 = ({ onComplete }: Scene1Props) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"true" | "false" | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const problem = PROBLEMS[idx];
  const truth = useMemo(() => evalOp(problem.leftValue, problem.shownOp, problem.rightValue), [problem]);
  const isCorrect = picked !== null && (picked === "true") === truth;
  const allDone = solved.size === PROBLEMS.length;

  const submit = (choice: "true" | "false") => {
    setPicked(choice);
    if ((choice === "true") === truth) {
      setSolved((s) => new Set(s).add(idx));
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => (i + 1) % PROBLEMS.length);
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full" aria-labelledby="bookstore-scene1-heading">
      <h2 id="bookstore-scene1-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">📖 </span>Read & Check
      </h2>

      <AverySpeech>
        Tap a symbol to hear what it means: <Inequality op="lt" /> is "less than",{" "}
        <Inequality op="gt" /> is "greater than", <Inequality op="eq" /> is "equal".
        Trick: the small point of <Inequality op="lt" /> or <Inequality op="gt" /> always points to
        the <em>smaller</em> number. Read the shelf tag and tell me — true or false?
      </AverySpeech>

      <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 shadow-sm">
        <p className="text-center text-sm text-muted-foreground mb-3">
          Statement {idx + 1} of {PROBLEMS.length} · solved {solved.size}/{PROBLEMS.length}
        </p>
        <div className="flex items-end justify-center gap-3 sm:gap-5 flex-wrap">
          <BookCover {...{ emoji: problem.leftEmoji, title: problem.leftTitle, value: problem.leftValue, unitSymbol: problem.unitSymbol, unit: problem.unit }} />
          <div className="text-4xl sm:text-5xl font-extrabold leading-none text-bookstore-leather-deep dark:text-bookstore-gold" aria-label={`is ${problem.shownOp === "lt" ? "less than" : problem.shownOp === "gt" ? "greater than" : "equal to"}`}>
            {SYM[problem.shownOp]}
          </div>
          <BookCover {...{ emoji: problem.rightEmoji, title: problem.rightTitle, value: problem.rightValue, unitSymbol: problem.unitSymbol, unit: problem.unit }} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3 italic">
          "{problem.unitSymbol}{problem.leftValue} {SYM[problem.shownOp]} {problem.unitSymbol}{problem.rightValue}"
        </p>
      </div>

      <div className="flex gap-3 justify-center" role="group" aria-label="True or false">
        <Button
          type="button"
          variant={picked === "true" ? "default" : "outline"}
          onClick={() => submit("true")}
          className="text-base font-bold w-28 h-12"
        >
          <span aria-hidden="true">✓ </span>True
        </Button>
        <Button
          type="button"
          variant={picked === "false" ? "default" : "outline"}
          onClick={() => submit("false")}
          className="text-base font-bold w-28 h-12"
        >
          <span aria-hidden="true">✗ </span>False
        </Button>
      </div>

      {picked && (
        <p className="text-center font-medium text-sm" role="status" aria-live="polite">
          {isCorrect
            ? `Right! ${problem.unitSymbol}${problem.leftValue} ${SYM[problem.shownOp]} ${problem.unitSymbol}${problem.rightValue} is ${truth ? "true" : "false"}.`
            : `Not quite — read the numbers again: ${problem.unitSymbol}${problem.leftValue} and ${problem.unitSymbol}${problem.rightValue}.`}
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
