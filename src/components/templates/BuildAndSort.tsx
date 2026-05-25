import { useEffect, useState, type ComponentType } from "react";
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
import AverySpeech from "../AverySpeech";
import SkillStamp from "../SkillStamp";
import Inequality, { type InequalityOp } from "../Inequality";
import { cn } from "@/lib/utils";

export type ShopTheme = "bookstore" | "bakery" | "smoothie";

export interface Book {
  title: string;
  emoji: string;
  value: number;
}

export interface Shelf {
  id: string;
  varName: string;
  prefix?: string;
  suffix?: string;
  threshold: number;
  correctOp: InequalityOp;
  hint: string;
}

export interface Round {
  prompt: string;
  varName: string;
  prefix?: string;
  suffix?: string;
  books: Book[];
  shelves: Shelf[];
}

interface BuildAndSortProps {
  rounds: Round[];
  skillLabel: string;
  heading: string;
  shopTheme?: ShopTheme;
  SpeechComponent?: ComponentType<{ text?: string }>;
  onComplete: () => void;
}

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

const THEME: Record<ShopTheme, {
  bookCover: string;
  bookBorder: string;
  cardBorder: string;
  shelfBorder: string;
  shelfBorderOver: string;
  shelfBg: string;
  shelfBgOver: string;
  opSelected: string;
  opSelectedText: string;
  opUnselectedBorder: string;
  opUnselectedHover: string;
  cartBg: string;
  placedBorder: string;
  btn: string;
}> = {
  bookstore: {
    bookCover: "from-bookstore-leather to-bookstore-leather-deep",
    bookBorder: "border-bookstore-leather-deep",
    cardBorder: "border-bookstore-leather/30",
    shelfBorder: "border-bookstore-leather/40",
    shelfBorderOver: "border-bookstore-leather",
    shelfBg: "bg-bookstore-parchment/20",
    shelfBgOver: "bg-bookstore-parchment/60",
    opSelected: "bg-bookstore-leather",
    opSelectedText: "text-white",
    opUnselectedBorder: "border-bookstore-leather/40",
    opUnselectedHover: "hover:bg-bookstore-parchment/40",
    cartBg: "bg-bookstore-parchment/30",
    placedBorder: "border-bookstore-leather/30",
    btn: "bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white",
  },
  bakery: {
    bookCover: "from-bakery-chocolate to-bakery-crust",
    bookBorder: "border-bakery-crust",
    cardBorder: "border-bakery-frosting-deep/30",
    shelfBorder: "border-bakery-frosting-deep/40",
    shelfBorderOver: "border-bakery-frosting-deep",
    shelfBg: "bg-bakery-cream/20",
    shelfBgOver: "bg-bakery-cream/60",
    opSelected: "bg-bakery-chocolate",
    opSelectedText: "text-white",
    opUnselectedBorder: "border-bakery-frosting-deep/40",
    opUnselectedHover: "hover:bg-bakery-cream/40",
    cartBg: "bg-bakery-cream/30",
    placedBorder: "border-bakery-frosting-deep/30",
    btn: "bg-gradient-to-r from-bakery-chocolate to-bakery-crust text-white",
  },
  smoothie: {
    bookCover: "from-primary to-accent",
    bookBorder: "border-accent",
    cardBorder: "border-primary/30",
    shelfBorder: "border-primary/40",
    shelfBorderOver: "border-primary",
    shelfBg: "bg-primary/5",
    shelfBgOver: "bg-primary/10",
    opSelected: "bg-primary",
    opSelectedText: "text-primary-foreground",
    opUnselectedBorder: "border-primary/40",
    opUnselectedHover: "hover:bg-primary/10",
    cartBg: "bg-primary/5",
    placedBorder: "border-primary/30",
    btn: "bg-gradient-to-r from-primary to-accent text-accent-foreground",
  },
};

function evalRule(value: number, op: InequalityOp, threshold: number) {
  switch (op) {
    case "lt": return value < threshold;
    case "lte": return value <= threshold;
    case "gt": return value > threshold;
    case "gte": return value >= threshold;
    case "eq": return value === threshold;
  }
}

function fmtValue(prefix: string | undefined, suffix: string | undefined, value: number) {
  return `${prefix ?? ""}${value}${suffix ?? ""}`;
}

// --- Draggable item ---
const DraggableItem = ({
  book,
  prefix,
  suffix,
  shelves,
  builtOps,
  onMoveTo,
  bouncing,
  disabled,
  theme,
}: {
  book: Book;
  prefix?: string;
  suffix?: string;
  shelves: Shelf[];
  builtOps: Record<string, InequalityOp | null>;
  onMoveTo: (shelfId: string) => void;
  bouncing: boolean;
  disabled?: boolean;
  theme: ShopTheme;
}) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({ id: `item-${book.title}`, disabled });
  const [pickerOpen, setPickerOpen] = useState(false);
  const t = THEME[theme];

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
        "relative flex items-center gap-2 rounded-xl border-2 bg-card p-2 shadow-sm",
        "transition-transform",
        bouncing && "motion-safe:animate-[bounce_0.5s_ease-in-out]",
        t.cardBorder,
      )}
      style={style}
    >
      <button
        ref={setNodeRef}
        type="button"
        {...listeners}
        {...attributes}
        aria-label={`${book.title}, ${fmtValue(prefix, suffix, book.value)}. Drag to a shelf, or use the Move to button.`}
        className={cn(
          "flex items-center gap-2 flex-1 cursor-grab active:cursor-grabbing rounded-lg p-1",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span
          className={cn(
            "w-12 h-14 rounded-md bg-gradient-to-br shadow flex items-center justify-center text-2xl border-r-4",
            t.bookCover,
            t.bookBorder,
          )}
          aria-hidden="true"
        >
          {book.emoji}
        </span>
        <span className="text-left">
          <span className="block font-semibold text-sm">{book.title}</span>
          <span className="block text-base font-extrabold">
            {fmtValue(prefix, suffix, book.value)}
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
  prefix,
  suffix,
  highlightWrong,
  theme,
}: {
  shelf: Shelf;
  builtOp: InequalityOp | null;
  placedBooks: Book[];
  prefix?: string;
  suffix?: string;
  highlightWrong: boolean;
  theme: ShopTheme;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: `shelf-${shelf.id}` });
  const t = THEME[theme];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border-2 border-dashed p-3 min-h-[110px] transition-colors",
        isOver
          ? cn(t.shelfBorderOver, t.shelfBgOver)
          : cn(t.shelfBorder, t.shelfBg),
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
              className={cn(
                "text-xs bg-card rounded px-2 py-1 border",
                t.placedBorder,
              )}
            >
              {b.emoji} {b.title} ({fmtValue(prefix, suffix, b.value)})
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
  theme,
}: {
  shelf: Shelf;
  selected: InequalityOp | null;
  onPick: (op: InequalityOp) => void;
  locked: boolean;
  showError: boolean;
  theme: ShopTheme;
}) => {
  const t = THEME[theme];

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-3 bg-card shadow-sm",
        locked
          ? "border-green-500/60"
          : showError
            ? "border-destructive"
            : t.cardBorder,
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
                  ? cn(t.opSelected, t.opSelectedText)
                  : cn("bg-card", t.opUnselectedBorder, t.opUnselectedHover),
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

const BuildAndSort = ({
  rounds,
  skillLabel,
  heading,
  shopTheme = "bookstore",
  SpeechComponent = AverySpeech,
  onComplete,
}: BuildAndSortProps) => {
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

  const round = rounds[roundIdx];

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
      setAnnouncement("Rules built! Now drag each item to its shelf.");
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
        `Not a match. Your rule says ${shelf.varName} ${OP_NAME[op]} ${shelf.prefix ?? ""}${shelf.threshold}${shelf.suffix ?? ""}, but ${book.title} is ${fmtValue(round.prefix, round.suffix, book.value)}.`,
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
    const bookTitle = String(active.id).replace(/^item-/, "");
    const shelfId = String(over.id).replace(/^shelf-/, "");
    const book = round.books.find((b) => b.title === bookTitle);
    if (!book) return;
    attemptPlace(book, shelfId);
  };

  // When everything is placed, advance to round-complete view
  useEffect(() => {
    if (phase === "sort" && allPlaced) {
      setPhase("done");
      setAnnouncement("All items sorted!");
    }
  }, [phase, allPlaced]);

  const isLastRound = roundIdx >= rounds.length - 1;
  const t = THEME[shopTheme];

  return (
    <section
      className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full"
      aria-labelledby="buildsort-heading"
    >
      <h2
        id="buildsort-heading"
        className="text-2xl font-bold text-center"
      >
        {heading}
      </h2>

      <SpeechComponent text={round.prompt} />

      <p className="text-center text-xs text-muted-foreground">
        Round {roundIdx + 1} of {rounds.length} ·{" "}
        {phase === "build"
          ? "Step 1: build the rules"
          : phase === "sort"
            ? `Step 2: sort the items (${Object.keys(placed).length}/${round.books.length})`
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
                theme={shopTheme}
              />
            ))}
          </div>
          <Button
            onClick={checkBuild}
            disabled={!allBuilt}
            className={cn("disabled:opacity-50", t.btn)}
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
                  prefix={round.prefix}
                  suffix={round.suffix}
                  highlightWrong={wrongShelf === s.id}
                  theme={shopTheme}
                />
              );
            })}
          </div>

          <div className={cn("rounded-2xl border-2 p-3", t.cartBg, t.cardBorder)}>
            <p className="text-xs text-muted-foreground mb-2">
              Cart — drag an item to a shelf, or use its "Move to…" button.
            </p>
            {remainingBooks.length === 0 ? (
              <p className="text-sm font-medium">Cart empty 🎉</p>
            ) : (
              <div className="flex flex-col gap-2">
                {remainingBooks.map((b) => (
                  <DraggableItem
                    key={b.title}
                    book={b}
                    prefix={round.prefix}
                    suffix={round.suffix}
                    shelves={round.shelves}
                    builtOps={builtOps}
                    onMoveTo={(shelfId) => attemptPlace(b, shelfId)}
                    bouncing={bouncing === b.title}
                    theme={shopTheme}
                  />
                ))}
              </div>
            )}
          </div>
        </DndContext>
      )}

      {phase === "done" && (
        <div className="bg-card border rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl mb-1" aria-hidden="true">
            🎉
          </p>
          <p className="font-semibold mb-2">Round {roundIdx + 1} sorted!</p>
          <p className="text-sm text-muted-foreground mb-3">
            Every item obeys the rule <strong>you wrote</strong> — that's how real catalogs work.
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
              <SkillStamp label={skillLabel} />
            </div>
          )}
          {!isLastRound ? (
            <Button
              onClick={() => setRoundIdx((r) => r + 1)}
              className={t.btn}
            >
              Next round <span aria-hidden="true">→</span>
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className={t.btn}
            >
              Finish shop <span aria-hidden="true">🎉</span>
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default BuildAndSort;
