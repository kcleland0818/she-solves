import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";
import Inequality, { InequalityOp } from "./Inequality";

interface Scene3Props {
  onComplete: () => void;
}

// COMPARE / SORT: drag-style shelf sorting. Each book has a page count;
// learner taps the shelf whose inequality the book satisfies.
// Shelves are labelled with compound inequalities — a brand-new mechanic.
type Book = { title: string; emoji: string; pages: number };

type Round = {
  prompt: string;
  books: Book[];
  // Three shelves with inequalities about pages.
  shelves: { id: string; label: string; test: (p: number) => boolean }[];
};

const ROUNDS: Round[] = [
  {
    prompt: "Sort tonight's returns onto the right shelf by page count.",
    books: [
      { title: "Tiny Tales", emoji: "📕", pages: 48 },
      { title: "Mystery Hour", emoji: "📗", pages: 180 },
      { title: "Epic Quest", emoji: "📘", pages: 420 },
      { title: "Picture Pals", emoji: "📙", pages: 22 },
    ],
    shelves: [
      { id: "short", label: "pages < 100", test: (p) => p < 100 },
      { id: "mid", label: "100 ≤ pages ≤ 300", test: (p) => p >= 100 && p <= 300 },
      { id: "long", label: "pages > 300", test: (p) => p > 300 },
    ],
  },
  {
    prompt: "New shipment! Sort by price.",
    books: [
      { title: "Pocket Poems", emoji: "📕", pages: 5 },
      { title: "Cookbook", emoji: "📗", pages: 12 },
      { title: "Rare Atlas", emoji: "📘", pages: 28 },
      { title: "Used Mystery", emoji: "📙", pages: 8 },
    ],
    shelves: [
      { id: "cheap", label: "price ≤ $10", test: (p) => p <= 10 },
      { id: "mid", label: "$10 < price < $25", test: (p) => p > 10 && p < 25 },
      { id: "premium", label: "price ≥ $25", test: (p) => p >= 25 },
    ],
  },
];

const opMap: Record<string, InequalityOp> = {
  "<": "lt",
  ">": "gt",
  "≤": "lte",
  "≥": "gte",
  "=": "eq",
};

// Parse a shelf label like "pages < 100" or "100 ≤ pages ≤ 300" and
// render the inequality symbols as tappable <Inequality> pills.
const ShelfLabel = ({ label }: { label: string }) => {
  // Split on inequality symbols, keeping the delimiters
  const parts = label.split(/([<>≤≥=])/);
  return (
    <span className="text-base font-bold text-foreground">
      {parts.map((part, i) => {
        const op = opMap[part];
        if (op) {
          return <Inequality key={i} op={op} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const BookstoreScene3 = ({ onComplete }: Scene3Props) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [bookIdx, setBookIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<string, string>>({}); // bookTitle -> shelfId
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);

  const round = ROUNDS[roundIdx];
  const book = round.books[bookIdx];
  const isPriceRound = roundIdx === 1;
  const value = book?.pages ?? 0;
  const correctShelf = useMemo(
    () => round.shelves.find((s) => s.test(value)) ?? round.shelves[0],
    [round, value]
  );
  const allBooksDone = bookIdx >= round.books.length;
  const allRoundsDone = roundIdx >= ROUNDS.length - 1 && allBooksDone;

  const place = (shelfId: string) => {
    if (shelfId === correctShelf.id) {
      setPlaced((p) => ({ ...p, [book.title]: shelfId }));
      setFeedback("right");
      setTimeout(() => {
        setFeedback(null);
        setBookIdx((i) => i + 1);
      }, 700);
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 900);
    }
  };

  const nextRound = () => {
    setRoundIdx((r) => r + 1);
    setBookIdx(0);
    setPlaced({});
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full" aria-labelledby="bookstore-scene3-heading">
      <h2 id="bookstore-scene3-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">📚 </span>Sort the Shelves
      </h2>

      <AverySpeech text={round.prompt} />

      <p className="text-center text-xs text-muted-foreground">
        Round {roundIdx + 1} of {ROUNDS.length} · placed {Object.keys(placed).length}/{round.books.length}
      </p>

      {!allBooksDone ? (
        <>
          <div
            className={`bg-card border-2 rounded-2xl p-4 shadow-sm flex flex-col items-center transition-colors ${
              feedback === "right" ? "border-green-500" : feedback === "wrong" ? "border-destructive" : "border-bookstore-leather/30"
            }`}
            aria-live="polite"
          >
            <p className="text-xs text-muted-foreground mb-2">Pick the right shelf for:</p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 rounded-md bg-gradient-to-br from-bookstore-leather to-bookstore-leather-deep shadow flex items-center justify-center text-3xl border-r-4 border-bookstore-leather-deep" aria-hidden="true">
                {book.emoji}
              </div>
              <div>
                <div className="font-semibold">{book.title}</div>
                <div className="text-xl font-extrabold">
                  {isPriceRound ? `$${value}` : `${value} pages`}
                </div>
              </div>
            </div>
            {feedback === "wrong" && (
              <p className="mt-2 text-xs text-destructive font-medium" role="status">
                Not that shelf — check the inequality again.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2" role="group" aria-label="Shelves">
            {round.shelves.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                onClick={() => place(s.id)}
                className="h-auto py-3 px-4 justify-between border-2 border-dashed border-bookstore-leather/40 hover:border-bookstore-leather hover:bg-bookstore-parchment/40"
                aria-label={`Shelf for ${s.label}`}
              >
                <ShelfLabel label={s.label} />
                <span className="text-xl" aria-hidden="true">📚</span>
              </Button>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl mb-1" aria-hidden="true">🎉</p>
          <p className="font-semibold mb-3">Round {roundIdx + 1} sorted!</p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-3">
            {round.books.map((b) => {
              const shelf = round.shelves.find((s) => s.id === placed[b.title]);
              return (
                <li key={b.title}>
                  {b.emoji} <strong>{b.title}</strong> → {shelf?.label}
                </li>
              );
            })}
          </ul>
          {!allRoundsDone ? (
            <Button onClick={nextRound} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
              Next round <span aria-hidden="true">→</span>
            </Button>
          ) : (
            <Button onClick={onComplete} className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white">
              Finish shop <span aria-hidden="true">🎉</span>
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default BookstoreScene3;
