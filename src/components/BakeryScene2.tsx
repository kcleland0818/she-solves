import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PennySpeech from "./PennySpeech";

interface Scene2Props {
  onComplete: () => void;
}

// Each challenge: shade `target` cupcakes on a tray of `total`, prove it equals `equivalent`.
// Lead with thirds and quarters; halves come up but aren't the dominant lesson.
const challenges = [
  { rows: 2, cols: 3, target: 2, equivLabel: "1/3", trayLabel: "2/6" },
  { rows: 2, cols: 4, target: 6, equivLabel: "3/4", trayLabel: "6/8" },
  { rows: 3, cols: 4, target: 4, equivLabel: "1/3", trayLabel: "4/12" },
  { rows: 2, cols: 4, target: 2, equivLabel: "1/4", trayLabel: "2/8" },
  { rows: 2, cols: 3, target: 3, equivLabel: "1/2", trayLabel: "3/6" },
  { rows: 3, cols: 4, target: 9, equivLabel: "3/4", trayLabel: "9/12" },
  { rows: 2, cols: 4, target: 4, equivLabel: "1/2", trayLabel: "4/8" },
  { rows: 3, cols: 4, target: 8, equivLabel: "2/3", trayLabel: "8/12" },
];

// Explore tray options — variety of shapes so kids see how denominators change.
const exploreTrays = [
  { rows: 1, cols: 3, label: "1×3 (thirds)" },
  { rows: 2, cols: 3, label: "2×3 (sixths)" },
  { rows: 2, cols: 4, label: "2×4 (eighths)" },
  { rows: 3, cols: 4, label: "3×4 (twelfths)" },
];

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

// Reduce a/b to lowest terms.
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const simplify = (n: number, d: number) => {
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
};

const BakeryScene2 = ({ onComplete }: Scene2Props) => {
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [exploreTrayIdx, setExploreTrayIdx] = useState(1); // start at 2x3 = sixths
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);
  const [shaded, setShaded] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[challengeIdx];
  const exploreTray = exploreTrays[exploreTrayIdx];
  const rows = phase === "explore" ? exploreTray.rows : challenge.rows;
  const cols = phase === "explore" ? exploreTray.cols : challenge.cols;
  const total = rows * cols;

  const newChallenge = useCallback(() => {
    const { idx } = pickRandom(challenges, lastChallengeIdx);
    setChallengeIdx(idx);
    setLastChallengeIdx(idx);
    setShaded(new Set());
    setFeedback("");
    setShowHint(false);
    setPhase("challenge");
  }, [lastChallengeIdx]);

  // Reset shading whenever the visible tray changes.
  useEffect(() => {
    setShaded(new Set());
    setFeedback("");
  }, [rows, cols]);

  const cells = useMemo(
    () => Array.from({ length: total }, (_, i) => i),
    [total],
  );

  const exploreSimplified = useMemo(
    () => simplify(shaded.size, total),
    [shaded.size, total],
  );

  const toggleCell = (i: number) => {
    if (phase === "done") return;
    setShaded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    setFeedback("");
  };

  const handleCheck = () => {
    if (shaded.size === challenge.target) {
      setFeedback(
        `Yes! ${challenge.trayLabel} is the same amount as ${challenge.equivLabel}. Same cake — different slicing!`,
      );
      setPhase("done");
    } else if (shaded.size < challenge.target) {
      setFeedback(`Not quite — frost ${challenge.target - shaded.size} more cupcake${challenge.target - shaded.size === 1 ? "" : "s"}.`);
    } else {
      setFeedback(`Too many frosted! Remove ${shaded.size - challenge.target}.`);
    }
  };

  return (
    <section
      className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto"
      aria-labelledby="bakery-scene2-heading"
    >
      <h2 id="bakery-scene2-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">🧁 </span>Equal Slices, Different Trays
      </h2>

      <PennySpeech
        text={
          phase === "explore"
            ? "Pick a tray, then frost some cupcakes! Watch the fraction below — when you frost 'half' a tray of 6, that's 3/6. Same as 1/2. Try it!"
            : phase === "challenge"
            ? `Show me ${challenge.equivLabel} of this tray of ${total} cupcakes! Tap cupcakes to add frosting. How many should you frost?`
            : `Beautiful! ${challenge.trayLabel} = ${challenge.equivLabel}. Both top AND bottom got multiplied by the same number — the amount stays equal.`
        }
      />

      {phase === "explore" && (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-card border border-bakery-frosting-deep/20 rounded-xl p-2">
          <span className="text-sm text-muted-foreground w-full text-center md:w-auto">Tray:</span>
          {exploreTrays.map((t, i) => (
            <Button
              key={t.label}
              type="button"
              size="sm"
              variant={exploreTrayIdx === i ? "default" : "outline"}
              onClick={() => setExploreTrayIdx(i)}
              aria-pressed={exploreTrayIdx === i}
              className={exploreTrayIdx === i ? "bg-bakery-frosting-deep text-accent-foreground" : ""}
            >
              {t.label}
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {phase === "explore" ? (
          <p className="text-sm text-muted-foreground text-center">
            Frosted:{" "}
            <span className="font-bold text-foreground text-base">
              {shaded.size}/{total}
            </span>
            {shaded.size > 0 && exploreSimplified.d !== total && (
              <>
                {" "}— same as{" "}
                <span className="font-bold text-foreground text-base">
                  {exploreSimplified.n}/{exploreSimplified.d}
                </span>
              </>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Goal: frost <span className="font-bold text-foreground text-base">{challenge.equivLabel}</span> of the tray
            {" "}— frosted: <span className="font-semibold text-foreground">{shaded.size}/{total}</span>
          </p>
        )}

        <div
          className="bg-bakery-tray/50 rounded-2xl p-3 md:p-4 border-2 border-bakery-crust shadow-md"
          role="grid"
          aria-label={`Cupcake tray with ${rows} rows and ${cols} columns. ${shaded.size} of ${total} frosted.`}
        >
          <div
            className="grid gap-2 md:gap-3"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {cells.map((i) => {
              const isShaded = shaded.has(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleCell(i)}
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    isShaded
                      ? "bg-bakery-frosting scale-105 shadow-md"
                      : "bg-bakery-cream hover:scale-105"
                  } border-2 border-bakery-chocolate/40`}
                  aria-pressed={isShaded}
                  aria-label={`Cupcake ${i + 1}, ${isShaded ? "frosted" : "plain"}`}
                >
                  <span className="text-xl md:text-2xl" aria-hidden="true">
                    {isShaded ? "🧁" : "🍪"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sr-only" aria-live="polite">
          {shaded.size} of {total} cupcakes frosted.
        </div>
      </div>

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in" role="status" aria-live="polite">
          {feedback}
        </p>
      )}

      {phase === "explore" && (
        <Button
          onClick={newChallenge}
          className="mx-auto bg-gradient-to-r from-bakery-frosting-deep to-accent text-accent-foreground"
        >
          Try a Customer Order! <span aria-hidden="true">🛎️</span>
        </Button>
      )}

      {phase === "challenge" && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}>
            {showHint ? "Hide Hint" : "Hint"}
          </Button>
          <Button onClick={handleCheck}>Check the Tray</Button>
        </div>
      )}

      {showHint && phase === "challenge" && (
        <p
          className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in"
          role="status"
        >
          {challenge.equivLabel} of {total} means: divide {total} by {challenge.equivLabel.split("/")[1]} to find the group size, then take {challenge.equivLabel.split("/")[0]} group{challenge.equivLabel.split("/")[0] === "1" ? "" : "s"}. That's {challenge.target} cupcake{challenge.target === 1 ? "" : "s"}.
        </p>
      )}

      {phase === "done" && (
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={newChallenge}>
            Try Another Tray
          </Button>
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-bakery-frosting-deep to-accent text-accent-foreground"
          >
            Next Scene <span aria-hidden="true">→</span>
          </Button>
        </div>
      )}
    </section>
  );
};

export default BakeryScene2;
