import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";
import { InequalityOp } from "./Inequality";

interface Scene2Props {
  onComplete: () => void;
}

// Write: translate a sentence into an inequality by picking the correct op.
// Includes ≤ and ≥ via "at least" / "at most" / "no more than".
type Problem = {
  sentence: string;          // e.g. "Readers must be at least 12 years old"
  variable: string;          // e.g. "age"
  number: number;            // e.g. 12
  answer: InequalityOp;      // gte
  // Order in the inequality: variable {op} number
  hint: string;
};

const PROBLEMS: Problem[] = [
  {
    sentence: "Readers must be at least 12 years old to buy this book.",
    variable: "age",
    number: 12,
    answer: "gte",
    hint: "“at least 12” means 12 is okay, and anything bigger is okay.",
  },
  {
    sentence: "Picture books have fewer than 50 pages.",
    variable: "pages",
    number: 50,
    answer: "lt",
    hint: "“fewer than 50” doesn't include 50 itself.",
  },
  {
    sentence: "You can spend no more than 20 dollars on the gift card.",
    variable: "spend",
    number: 20,
    answer: "lte",
    hint: "“no more than 20” means 20 is okay, but nothing higher.",
  },
  {
    sentence: "The book club needs more than 6 members to meet.",
    variable: "members",
    number: 6,
    answer: "gt",
    hint: "“more than 6” doesn't include 6 itself.",
  },
  {
    sentence: "The reading challenge requires at most 30 books per year.",
    variable: "books",
    number: 30,
    answer: "lte",
    hint: "“at most 30” means 30 is okay, nothing higher.",
  },
];

const SYM: Record<InequalityOp, string> = { lt: "<", gt: ">", eq: "=", lte: "≤", gte: "≥" };
const PHRASE: Record<InequalityOp, string> = {
  lt: "less than",
  gt: "greater than",
  lte: "less than or equal to",
  gte: "greater than or equal to",
  eq: "equals",
};

const OPTIONS: InequalityOp[] = ["lt", "lte", "gt", "gte"];

const BookstoreScene2 = ({ onComplete }: Scene2Props) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<InequalityOp | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const problem = PROBLEMS[idx];
  const isCorrect = picked === problem.answer;
  const allDone = useMemo(() => solved.size === PROBLEMS.length, [solved]);

  const submit = (op: InequalityOp) => {
    setPicked(op);
    if (op === problem.answer) {
      setSolved((s) => new Set(s).add(idx));
    }
  };

  const next = () => {
    setPicked(null);
    setShowHint(false);
    setIdx((i) => (i + 1) % PROBLEMS.length);
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="bookstore-scene2-heading">
      <h2 id="bookstore-scene2-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">✍️ </span>Write the Inequality
      </h2>

      <AverySpeech text="Read the sentence carefully. Watch for words like 'at least', 'at most', 'fewer than', 'more than' — they tell you which symbol to pick." />

      <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 shadow-sm">
        <p className="text-center text-sm text-muted-foreground mb-2">
          Problem {idx + 1} of {PROBLEMS.length} · solved {solved.size}/{PROBLEMS.length}
        </p>
        <p className="text-center text-base text-foreground font-medium mb-3">
          “{problem.sentence}”
        </p>
        <div className="flex items-center justify-center gap-2 text-2xl font-bold flex-wrap">
          <span className="px-3 py-1 rounded-md bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground">
            {problem.variable}
          </span>
          <span
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground border-2 border-dashed border-bookstore-leather/40"
            aria-label={picked ? `symbol ${SYM[picked]}` : "missing symbol"}
          >
            {picked ? SYM[picked] : "?"}
          </span>
          <span className="px-3 py-1 rounded-md bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground">
            {problem.number}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Choose an inequality symbol">
        {OPTIONS.map((op) => (
          <Button
            key={op}
            type="button"
            variant={picked === op ? "default" : "outline"}
            onClick={() => submit(op)}
            className="h-14 flex flex-col items-center justify-center gap-0"
            aria-label={`Pick ${PHRASE[op]}`}
          >
            <span className="text-xl font-bold">{SYM[op]}</span>
            <span className="text-[10px] text-muted-foreground">{PHRASE[op]}</span>
          </Button>
        ))}
      </div>

      {picked && (
        <p className="text-center font-medium text-sm" role="status" aria-live="polite">
          {isCorrect
            ? `Right! "${problem.variable} ${SYM[problem.answer]} ${problem.number}" matches the sentence.`
            : `Not quite. Re-read the words — what do they really allow?`}
        </p>
      )}

      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint}>
          {showHint ? "Hide hint" : "Hint"}
        </Button>
        {picked && !isCorrect && (
          <Button variant="outline" size="sm" onClick={() => setPicked(null)}>Try again</Button>
        )}
        {isCorrect && !allDone && (
          <Button size="sm" onClick={next} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
            Next sentence <span aria-hidden="true">→</span>
          </Button>
        )}
        {allDone && (
          <Button size="sm" onClick={onComplete} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
            On to comparing! <span aria-hidden="true">→</span>
          </Button>
        )}
      </div>

      {showHint && (
        <p className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in" role="status">
          {problem.hint}
        </p>
      )}
    </section>
  );
};

export default BookstoreScene2;
