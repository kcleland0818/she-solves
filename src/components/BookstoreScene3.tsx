import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AverySpeech from "./AverySpeech";
import SkillStamp from "./SkillStamp";
import Inequality, { InequalityOp } from "./Inequality";
import { cn } from "@/lib/utils";

interface Scene3Props {
  onComplete: () => void;
}

/**
 * "Build & Sort the Shelves" — a two-phase exercise.
 *
 * Phase 1 (Build): learner authors an inequality for each shelf by picking
 * an operator (<, ≤, >, ≥). Until all shelves have a valid rule that
 * partitions the books, the Sort phase is locked.
 *
 * Phase 2 (Sort): books appear on a cart; learner drags each onto the
 * shelf whose rule it satisfies. Wrong drop = bounce back with a hint
 * that references the learner's own rule.
 *
 * Accessibility:
 *  - dnd-kit with KeyboardSensor + TouchSensor + PointerSensor.
 *  - Every book also has a "Move to…" Popover with shelf buttons, so
 *    keyboard / SR / touch users have a first-class non-drag path.
 *  - aria-live region announces pick-up, drop, and result.
 *  - Focus-visible rings; no hover-only affordances.
 *  - Honors prefers-reduced-motion (bounce uses CSS transition gated on a
 *    media query in index.css; we use a short opacity+translate that
 *    automatically degrades).
 */

type Book = { title: string; emoji: string; value: number };

type Shelf = {
  id: string;
  // Variable name displayed in the rule (e.g. "pages", "price")
  varName: string;
  // Unit label when displaying book values ("pages", "$")
  prefix?: string;
  suffix?: string;
  // The threshold the learner must compare against
  threshold: number;
  // The correct operator for this shelf (used to validate the built rule)
  correctOp: InequalityOp;
  // Friendly hint shown above the operator picker
  hint: string;
};

type Round = {
  prompt: string;
  varName: string;
  prefix?: string;
  suffix?: string;
  books: Book[];
  shelves: Shelf[];
};

const ROUNDS: Round[] = [
  {
    prompt:
      "First, build each shelf's rule. Then drag tonight's returns onto the shelf they belong on.",
    varName: "pages",
    suffix: " pages",
    books: [
      { title: "Tiny Tales", emoji: "📕", value: 48 },
      { title: "Picture Pals", emoji: "📙", value: 22 },
      { title: "Mystery Hour", emoji: "📗", value: 320 },
      { title: "Epic Quest", emoji: "📘", value: 420 },
    ],
    shelves: [
      {
        id: "short",
        varName: "pages",
        suffix: " pages",
        threshold: 100,
        correctOp: "lt",
        hint: "Short reads — fewer than 100 pages.",
      },
      {
        id: "long",
        varName: "pages",
        suffix: " pages",
        threshold: 300,
        correctOp: "gt",
        hint: "Doorstoppers — more than 300 pages.",
      },
    ],
  },
  {
    prompt: "New shipment! Build the price rules, then sort each book.",
    varName: "price",
    prefix: "$",
    books: [
      { title: "Pocket Poems", emoji: "📕", value: 5 },
      { title: "Used Mystery", emoji: "📙", value: 8 },
      { title: "Cookbook", emoji: "📗", value: 18 },
      { title: "Rare Atlas", emoji: "📘", value: 28 },
    ],
    shelves: [
      {
        id: "cheap",
        varName: "price",
        prefix: "$",
        threshold: 10,
        correctOp: "lte",
        hint: "Bargain bin — $10 or less.",
      },
      {
        id: "premium",
        varName: "price",
        prefix: "$",
        threshold: 15,
        correctOp: "gte",
        hint: "Premium reads — $15 and up.",
      },
    ],
  },
];

const OP_OPTIONS: InequalityOp[] = ["lt", "lte", "gt", "gte"];
const OP_SYMBOL: Record<InequalityOp, string> = {
  lt: "<",
  lte: "≤",
  gt: ">",
  gte: "≥",
  eq: "=",
};
const OP_NAME: Record<InequalityOp, string> = {
  lt: "less than",
  lte: "less than or equal to",
  gt: "greater than",
  gte: "greater than or equal to",
  eq: "equals",
};

function evalRule(value: number, op: InequalityOp, threshold: number) {
  switch (op) {
    case "lt":
      return value < threshold;
    case "lte":
      return value <= threshold;
    case "gt":
      return value > threshold;
    case "gte":
      return value >= threshold;
    case "eq":
      return value === threshold;
  }
}

function formatValue(round: Round, value: number) {
  return `${round.prefix ?? ""}${value}${round.suffix ?? ""}`;
}

// --- Draggable book ---
const DraggableBook = ({
  book,
  round,
  shelves,
  builtOps,
  onMoveTo,
  bouncing,
  disabled,
}: {
  book: Book;
  round: Round;
  shelves: Shelf[];
  builtOps: Record<string, InequalityOp | null>;
  onMoveTo: (shelfId: string) => void;
  bouncing: boolean;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({ id: `book-${book.title}`, disabled });
  const [pickerOpen, setPickerOpen] = useState(false);

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-xl border-2 border-bookstore-leather/30 bg-card p-2 shadow-sm",
        "transition-transform",
        bouncing && "motion-safe:animate-[bounce_0.5s_ease-in-out]",
      )}
      style={style}
    >
      <button
        ref={setNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        aria-label={`${book.title}, ${formatValue(round, book.value)}. Drag to a shelf, or use the Move to button.`}
        className={cn(
          "flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing rounded-lg p-1",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span
          className="w-12 h-14 rounded-md bg-gradient-to-br from-bookstore-leather to-bookstore-leather-deep shadow flex items-center justify-center text-2xl border-r-4 border-bookstore-leather-deep"
          aria-hidden="true"
        >
          {book.emoji}
        </span>
        <span className="text-left">
          <span className="block font-semibold text-sm">{book.title}</span>
          <span className="block text-base font-extrabold">
            {formatValue(round, book.value)}
          </span>
        </span>
      </button>
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            disabled={disabled}
            aria-label={`Move ${book.title} to a shelf`}
          >
            Move to…
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" side="top" align="end">
          <p className="text-xs text-muted-foreground mb-2 px-1">
            Send {book.title} to:
          </p>
          <div className="flex flex-col gap-1">
            {shelves.map((s) => {
              const op = builtOps[s.id];
              return (
                <Button
                  key={s.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start h-auto py-2"
                  onClick={() => {
                    setPickerOpen(false);
                    onMoveTo(s.id);
                  }}
                >
                  <span className="text-sm">
                    Shelf: {s.varName} {op ? OP_SYMBOL[op] : "?"}{" "}
                    {s.prefix ?? ""}
                    {s.threshold}
                    {s.suffix ?? ""}
                  </span>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// --- Droppable shelf ---
const DroppableShelf = ({
  shelf,
  builtOp,
  placedBooks,
  round,
  highlightWrong,
}: {
  shelf: Shelf;
  builtOp: InequalityOp | null;
  placedBooks: Book[];
  round: Round;
  highlightWrong: boolean;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: `shelf-${shelf.id}` });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border-2 border-dashed p-3 min-h-[110px] transition-colors bg-bookstore-parchment/20",
        isOver
          ? "border-bookstore-leather bg-bookstore-parchment/60"
          : "border-bookstore-leather/40",
        highlightWrong && "border-destructive bg-destructive/10",
      )}
      aria-label={`Shelf for ${shelf.varName} ${
        builtOp ? OP_NAME[builtOp] : "(rule not built yet)"
      } ${shelf.prefix ?? ""}${shelf.threshold}${shelf.suffix ?? ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{shelf.hint}</p>
        <span aria-hidden="true">📚</span>
      </div>
      <div className="text-base font-bold flex items-center gap-1 flex-wrap">
        <span>{shelf.varName}</span>
        {builtOp ? (
          <Inequality op={builtOp} />
        ) : (
          <span className="px-2 rounded-md bg-muted text-muted-foreground text-sm">
            ?
          </span>
        )}
        <span>
          {shelf.prefix ?? ""}
          {shelf.threshold}
          {shelf.suffix ?? ""}
        </span>
      </div>
      {placedBooks.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {placedBooks.map((b) => (
            <li
              key={b.title}
              className="text-xs bg-card rounded px-2 py-1 border border-bookstore-leather/30"
            >
              {b.emoji} {b.title} ({formatValue(round, b.value)})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Operator picker for the Build phase ---
const OperatorPicker = ({
  shelf,
  selected,
  onPick,
  locked,
  showError,
}: {
  shelf: Shelf;
  selected: InequalityOp | null;
  onPick: (op: InequalityOp) => void;
  locked: boolean;
  showError: boolean;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-3 bg-card shadow-sm",
        locked
          ? "border-green-500/60"
          : showError
            ? "border-destructive"
            : "border-bookstore-leather/30",
      )}
    >
      <p className="text-xs text-muted-foreground mb-1">{shelf.hint}</p>
      <div className="text-lg font-bold flex items-center gap-2 mb-2 flex-wrap">
        <span>{shelf.varName}</span>
        {selected ? (
          <Inequality op={selected} />
        ) : (
          <span className="px-2 rounded-md bg-muted text-muted-foreground">
            ?
          </span>
        )}
        <span>
          {shelf.prefix ?? ""}
          {shelf.threshold}
          {shelf.suffix ?? ""}
        </span>
      </div>
      <div
        role="radiogroup"
        aria-label={`Pick the operator for the ${shelf.hint} shelf`}
        className="flex gap-2 flex-wrap"
      >
        {OP_OPTIONS.map((op) => {
          const isSel = selected === op;
          return (
            <button
              key={op}
              type="button"
              role="radio"
              aria-checked={isSel}
              aria-label={OP_NAME[op]}
              disabled={locked}
              onClick={() => onPick(op)}
              className={cn(
                "min-w-[44px] h-11 px-3 rounded-lg border-2 font-bold text-lg transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSel
                  ? "border-bookstore-leather bg-bookstore-leather text-white"
                  : "border-bookstore-leather/40 bg-card hover:bg-bookstore-parchment/40",
                locked && "opacity-70 cursor-not-allowed",
              )}
            >
              {OP_SYMBOL[op]}
            </button>
          );
        })}
      </div>
      {showError && !locked && (
        <p className="mt-2 text-xs text-destructive font-medium">
          That rule wouldn't catch the right books — try another symbol.
        </p>
      )}
    </div>
  );
};

const BookstoreScene3 = ({ onComplete }: Scene3Props) => {
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<"build" | "sort" | "done">("build");
  const [builtOps, setBuiltOps] = useState<Record<string, InequalityOp | null>>(
    {},
  );
  const [buildErrors, setBuildErrors] = useState<Record<string, boolean>>({});
  const [placed, setPlaced] = useState<Record<string, string>>({}); // book.title -> shelfId
  const [bouncing, setBouncing] = useState<string | null>(null);
  const [wrongShelf, setWrongShelf] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const round = ROUNDS[roundIdx];

  // Reset state when the round changes
  useEffect(() => {
    const initial: Record<string, InequalityOp | null> = {};
    round.shelves.forEach((s) => (initial[s.id] = null));
    setBuiltOps(initial);
    setBuildErrors({});
    setPlaced({});
    setPhase("build");
    setAnnouncement("");
  }, [roundIdx, round.shelves]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const allBuilt = round.shelves.every((s) => builtOps[s.id] != null);
  const remainingBooks = round.books.filter((b) => !placed[b.title]);
  const allPlaced = remainingBooks.length === 0;

  const handlePickOp = (shelfId: string, op: InequalityOp) => {
    setBuiltOps((prev) => ({ ...prev, [shelfId]: op }));
    setBuildErrors((prev) => ({ ...prev, [shelfId]: false }));
  };

  const checkBuild = () => {
    const errors: Record<string, boolean> = {};
    let ok = true;
    for (const shelf of round.shelves) {
      const chosen = builtOps[shelf.id];
      // Validate by checking that the chosen rule catches the same books
      // as the intended correctOp does.
      if (!chosen) {
        errors[shelf.id] = true;
        ok = false;
        continue;
      }
      const intended = round.books.filter((b) =>
        evalRule(b.value, shelf.correctOp, shelf.threshold),
      );
      const actual = round.books.filter((b) =>
        evalRule(b.value, chosen, shelf.threshold),
      );
      const same =
        intended.length === actual.length &&
        intended.every((b) => actual.includes(b));
      if (!same) {
        errors[shelf.id] = true;
        ok = false;
      }
    }
    setBuildErrors(errors);
    if (ok) {
      setPhase("sort");
      setAnnouncement("Rules built! Now drag each book to its shelf.");
    } else {
      setAnnouncement("One or more rules don't fit — try a different symbol.");
    }
  };

  const attemptPlace = (book: Book, shelfId: string) => {
    const shelf = round.shelves.find((s) => s.id === shelfId)!;
    const op = builtOps[shelfId]!;
    const fits = evalRule(book.value, op, shelf.threshold);
    if (fits) {
      setPlaced((prev) => ({ ...prev, [book.title]: shelfId }));
      setAnnouncement(
        `Correct. ${book.title} placed on shelf ${shelf.varName} ${OP_NAME[op]} ${shelf.prefix ?? ""}${shelf.threshold}${shelf.suffix ?? ""}.`,
      );
    } else {
      setBouncing(book.title);
      setWrongShelf(shelfId);
      setAnnouncement(
        `Not a match. Your rule says ${shelf.varName} ${OP_NAME[op]} ${shelf.prefix ?? ""}${shelf.threshold}${shelf.suffix ?? ""}, but ${book.title} is ${formatValue(round, book.value)}.`,
      );
      window.setTimeout(() => {
        setBouncing(null);
        setWrongShelf(null);
      }, 700);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const bookTitle = String(active.id).replace(/^book-/, "");
    const shelfId = String(over.id).replace(/^shelf-/, "");
    const book = round.books.find((b) => b.title === bookTitle);
    if (!book) return;
    attemptPlace(book, shelfId);
  };

  // When everything is placed, advance to round-complete view
  useEffect(() => {
    if (phase === "sort" && allPlaced) {
      setPhase("done");
      setAnnouncement("All books shelved!");
    }
  }, [phase, allPlaced]);

  const isLastRound = roundIdx >= ROUNDS.length - 1;

  return (
    <section
      className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full"
      aria-labelledby="bookstore-scene3-heading"
    >
      <h2
        id="bookstore-scene3-heading"
        className="text-2xl font-bold text-center"
      >
        <span aria-hidden="true">📚 </span>Build & Sort the Shelves
      </h2>

      <AverySpeech text={round.prompt} />

      <p className="text-center text-xs text-muted-foreground">
        Round {roundIdx + 1} of {ROUNDS.length} ·{" "}
        {phase === "build"
          ? "Step 1: build the rules"
          : phase === "sort"
            ? `Step 2: sort the books (${Object.keys(placed).length}/${round.books.length})`
            : "Round complete"}
      </p>

      {/* Live region for SR announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {phase === "build" && (
        <>
          <div className="flex flex-col gap-3">
            {round.shelves.map((s) => (
              <OperatorPicker
                key={s.id}
                shelf={s}
                selected={builtOps[s.id] ?? null}
                onPick={(op) => handlePickOp(s.id, op)}
                locked={false}
                showError={!!buildErrors[s.id]}
              />
            ))}
          </div>
          <Button
            onClick={checkBuild}
            disabled={!allBuilt}
            className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white"
          >
            Check rules <span aria-hidden="true">→</span>
          </Button>
        </>
      )}

      {phase === "sort" && (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {round.shelves.map((s) => {
              const placedBooks = round.books.filter(
                (b) => placed[b.title] === s.id,
              );
              return (
                <DroppableShelf
                  key={s.id}
                  shelf={s}
                  builtOp={builtOps[s.id] ?? null}
                  placedBooks={placedBooks}
                  round={round}
                  highlightWrong={wrongShelf === s.id}
                />
              );
            })}
          </div>

          <div className="rounded-2xl border-2 border-bookstore-leather/30 bg-bookstore-parchment/30 p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Cart — drag a book to a shelf, or use its “Move to…” button.
            </p>
            {remainingBooks.length === 0 ? (
              <p className="text-sm font-medium">Cart empty 🎉</p>
            ) : (
              <div className="flex flex-col gap-2">
                {remainingBooks.map((b) => (
                  <DraggableBook
                    key={b.title}
                    book={b}
                    round={round}
                    shelves={round.shelves}
                    builtOps={builtOps}
                    onMoveTo={(shelfId) => attemptPlace(b, shelfId)}
                    bouncing={bouncing === b.title}
                  />
                ))}
              </div>
            )}
          </div>
        </DndContext>
      )}

      {phase === "done" && (
        <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl mb-1" aria-hidden="true">
            🎉
          </p>
          <p className="font-semibold mb-2">Round {roundIdx + 1} sorted!</p>
          <p className="text-sm text-muted-foreground mb-3">
            Every book obeys the rule <strong>you wrote</strong> — that's how real catalogs work.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-3">
            {round.shelves.map((s) => {
              const op = builtOps[s.id]!;
              const books = round.books.filter((b) => placed[b.title] === s.id);
              return (
                <li key={s.id}>
                  <strong>
                    {s.varName} {OP_SYMBOL[op]} {s.prefix ?? ""}
                    {s.threshold}
                    {s.suffix ?? ""}
                  </strong>{" "}
                  → {books.map((b) => `${b.emoji} ${b.title}`).join(", ")}
                </li>
              );
            })}
          </ul>
          {isLastRound && (
            <div className="mb-3 flex justify-center">
              <SkillStamp label="Comparing With Inequalities" />
            </div>
          )}
          {!isLastRound ? (
            <Button
              onClick={() => setRoundIdx((r) => r + 1)}
              className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white"
            >
              Next round <span aria-hidden="true">→</span>
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white"
            >
              Finish shop <span aria-hidden="true">🎉</span>
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default BookstoreScene3;
