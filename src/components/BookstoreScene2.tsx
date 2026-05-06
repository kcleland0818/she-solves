import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";
import { InequalityOp } from "./Inequality";

interface Scene2Props {
  onComplete: () => void;
}

// WRITE: translate a sentence into an inequality. After picking, a number line
// visualizes the solution set and sample values light up green/red so the
// learner sees the meaning of their symbol — very different from Scene 1.
type Problem = {
  sentence: string;
  variable: string;
  number: number;
  answer: InequalityOp;
  hint: string;
  // Min/max for the number line.
  range: [number, number];
  // Sample values to test on the line.
  samples: number[];
};

const PROBLEMS: Problem[] = [
  {
    sentence: "Readers must be at least 12 years old to buy this book.",
    variable: "age",
    number: 12,
    answer: "gte",
    hint: "“at least 12” means 12 is okay, and anything bigger is okay.",
    range: [8, 18],
    samples: [10, 12, 15],
  },
  {
    sentence: "Picture books have fewer than 50 pages.",
    variable: "pages",
    number: 50,
    answer: "lt",
    hint: "“fewer than 50” doesn't include 50 itself.",
    range: [0, 100],
    samples: [30, 50, 80],
  },
  {
    sentence: "You can spend no more than 20 dollars on the gift card.",
    variable: "spend",
    number: 20,
    answer: "lte",
    hint: "“no more than 20” means 20 is okay, but nothing higher.",
    range: [0, 40],
    samples: [10, 20, 30],
  },
  {
    sentence: "The book club needs more than 6 members to meet.",
    variable: "members",
    number: 6,
    answer: "gt",
    hint: "“more than 6” doesn't include 6 itself.",
    range: [0, 14],
    samples: [4, 6, 9],
  },
  {
    sentence: "The reading challenge requires at most 30 books per year.",
    variable: "books",
    number: 30,
    answer: "lte",
    hint: "“at most 30” means 30 is okay, nothing higher.",
    range: [0, 60],
    samples: [15, 30, 45],
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

const evalOp = (a: number, op: InequalityOp, b: number) => {
  switch (op) {
    case "lt": return a < b;
    case "gt": return a > b;
    case "eq": return a === b;
    case "lte": return a <= b;
    case "gte": return a >= b;
  }
};

// Compact number line that shades the solution region for the picked op.
const NumberLine = ({
  min, max, threshold, op, samples, variable,
}: {
  min: number; max: number; threshold: number; op: InequalityOp | null; samples: number[]; variable: string;
}) => {
  const span = max - min;
  const pct = (v: number) => ((v - min) / span) * 100;
  const tPct = pct(threshold);

  const shade =
    op === "lt" || op === "lte"
      ? { left: 0, width: tPct }
      : op === "gt" || op === "gte"
      ? { left: tPct, width: 100 - tPct }
      : null;

  const closed = op === "lte" || op === "gte";

  return (
    <div className="px-2 pt-2 pb-6">
      <div className="relative h-10">
        {/* shaded region */}
        {shade && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-bookstore-leather/40 dark:bg-bookstore-gold/40"
            style={{ left: `${shade.left}%`, width: `${shade.width}%` }}
            aria-hidden="true"
          />
        )}
        {/* base line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-foreground/30" aria-hidden="true" />
        {/* threshold marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${tPct}%` }}
          aria-hidden="true"
        >
          <div className={`w-4 h-4 rounded-full border-2 ${op ? "border-bookstore-leather-deep" : "border-foreground/50"} ${closed ? "bg-bookstore-leather-deep" : "bg-background"}`} />
        </div>
        <div className="absolute top-full mt-1 -translate-x-1/2 text-[11px] font-semibold" style={{ left: `${tPct}%` }}>
          {threshold}
        </div>
        {/* samples */}
        {samples.map((v) => {
          const ok = op ? evalOp(v, op, threshold) : null;
          return (
            <div
              key={v}
              className="absolute -translate-x-1/2 -top-2 text-center"
              style={{ left: `${pct(v)}%` }}
            >
              <div
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center border-2 transition-colors ${
                  ok === null
                    ? "bg-muted text-foreground border-border"
                    : ok
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500"
                    : "bg-destructive/20 text-destructive border-destructive"
                }`}
                aria-label={`${variable} = ${v}${ok === null ? "" : ok ? " satisfies" : " does not satisfy"}`}
              >
                {v}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full" aria-labelledby="bookstore-scene2-heading">
      <h2 id="bookstore-scene2-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">✍️ </span>Write & Visualize
      </h2>

      <AverySpeech text="Pick the symbol that fits the sentence — then watch the number line shade in to show every value that works." />

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

        <NumberLine
          min={problem.range[0]}
          max={problem.range[1]}
          threshold={problem.number}
          op={picked}
          samples={problem.samples}
          variable={problem.variable}
        />
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
            ? `Right! "${problem.variable} ${SYM[problem.answer]} ${problem.number}" — green values satisfy it, red ones don't.`
            : `Look at the number line — does the shaded region match what the sentence allows?`}
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
            On to sorting! <span aria-hidden="true">→</span>
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
