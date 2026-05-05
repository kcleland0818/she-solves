import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";
import { InequalityOp } from "./Inequality";

interface Scene3Props {
  onComplete: () => void;
}

// Compare: two books with multiple attributes. Pick the inequality + the attribute
// that makes the recommendation work for the customer.
type Book = { title: string; emoji: string; pages: number; price: number; ageMin: number };

type Problem = {
  customer: string;            // what the customer wants
  bookA: Book;
  bookB: Book;
  // The customer's request maps to a (attribute, op, threshold) and we ask:
  // "Which book matches?" — but to keep this about inequalities, we frame it as:
  // "Pick the inequality comparing the two books on the right attribute."
  attribute: "pages" | "price" | "ageMin";
  // The correct comparison reads as:  bookA.attribute  {op}  bookB.attribute
  hint: string;
};

const ATTR_LABEL: Record<Problem["attribute"], string> = {
  pages: "pages",
  price: "price ($)",
  ageMin: "min age",
};

const PROBLEMS: Problem[] = [
  {
    customer: "I want the shorter book — I only have a weekend.",
    bookA: { title: "Sky Riders", emoji: "🪂", pages: 92, price: 12, ageMin: 9 },
    bookB: { title: "Deep Forest", emoji: "🌲", pages: 240, price: 16, ageMin: 10 },
    attribute: "pages",
    hint: "Compare just the page counts: 92 and 240.",
  },
  {
    customer: "Which one is cheaper? Budget is tight today.",
    bookA: { title: "Tiny Chef", emoji: "🍳", pages: 64, price: 9, ageMin: 7 },
    bookB: { title: "Star Maps", emoji: "🌌", pages: 110, price: 18, ageMin: 9 },
    attribute: "price",
    hint: "Compare the prices: 9 and 18.",
  },
  {
    customer: "My niece is 8. Which book has the higher minimum age?",
    bookA: { title: "Robot Pals", emoji: "🤖", pages: 80, price: 11, ageMin: 6 },
    bookB: { title: "Spooky Tales", emoji: "👻", pages: 150, price: 13, ageMin: 10 },
    attribute: "ageMin",
    hint: "Compare the min ages: 6 and 10.",
  },
  {
    customer: "I'd love the longer one — I'm on vacation.",
    bookA: { title: "Ocean Quest", emoji: "🌊", pages: 320, price: 17, ageMin: 11 },
    bookB: { title: "Quick Mystery", emoji: "🔍", pages: 140, price: 12, ageMin: 9 },
    attribute: "pages",
    hint: "Compare 320 and 140.",
  },
];

const SYM: Record<InequalityOp, string> = { lt: "<", gt: ">", eq: "=", lte: "≤", gte: "≥" };

const computeOp = (a: number, b: number): InequalityOp =>
  a < b ? "lt" : a > b ? "gt" : "eq";

const OPTIONS: InequalityOp[] = ["lt", "gt", "eq"];

const BookstoreScene3 = ({ onComplete }: Scene3Props) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<InequalityOp | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const problem = PROBLEMS[idx];
  const aVal = problem.bookA[problem.attribute];
  const bVal = problem.bookB[problem.attribute];
  const correct = useMemo(() => computeOp(aVal, bVal), [aVal, bVal]);
  const isCorrect = picked === correct;
  const allDone = solved.size === PROBLEMS.length;

  const submit = (op: InequalityOp) => {
    setPicked(op);
    if (op === correct) setSolved((s) => new Set(s).add(idx));
  };

  const next = () => {
    setPicked(null);
    setShowHint(false);
    setIdx((i) => (i + 1) % PROBLEMS.length);
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="bookstore-scene3-heading">
      <h2 id="bookstore-scene3-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">⚖️ </span>Compare Two Books
      </h2>

      <AverySpeech text="A customer just told me what they want. Compare the two books on the right attribute and pick the symbol that makes the sentence true!" />

      <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-3 shadow-sm">
        <p className="text-center text-sm italic text-muted-foreground mb-2">
          "{problem.customer}"
        </p>
        <p className="text-center text-xs text-muted-foreground mb-3">
          Problem {idx + 1} of {PROBLEMS.length} · solved {solved.size}/{PROBLEMS.length}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[problem.bookA, problem.bookB].map((b, i) => (
            <div key={i} className="rounded-lg border border-border p-2 text-center bg-bookstore-parchment/40 dark:bg-muted/30">
              <div className="text-3xl" aria-hidden="true">{b.emoji}</div>
              <div className="font-semibold text-sm">{b.title}</div>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <li>📄 {b.pages} pages</li>
                <li>💲 {b.price}</li>
                <li>🎂 {b.ageMin}+</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-foreground flex-wrap">
        <span className="px-2 py-1 rounded-md bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground font-semibold text-sm">
          {problem.bookA.title} {ATTR_LABEL[problem.attribute]}
        </span>
        <span
          className="w-12 h-12 rounded-lg flex items-center justify-center bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground border-2 border-dashed border-bookstore-leather/40 text-2xl font-bold"
          aria-label={picked ? `symbol ${SYM[picked]}` : "missing symbol"}
        >
          {picked ? SYM[picked] : "?"}
        </span>
        <span className="px-2 py-1 rounded-md bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground font-semibold text-sm">
          {problem.bookB.title} {ATTR_LABEL[problem.attribute]}
        </span>
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
            {SYM[op]}
          </Button>
        ))}
      </div>

      {picked && (
        <p className="text-center font-medium text-sm" role="status" aria-live="polite">
          {isCorrect
            ? `Yes! ${aVal} ${SYM[correct]} ${bVal} — that matches what the customer asked for.`
            : `Not quite. Compare ${aVal} and ${bVal} for ${ATTR_LABEL[problem.attribute]}.`}
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
            Next customer <span aria-hidden="true">→</span>
          </Button>
        )}
        {allDone && (
          <Button size="sm" onClick={onComplete} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
            Finish shop <span aria-hidden="true">🎉</span>
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

export default BookstoreScene3;
