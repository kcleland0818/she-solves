import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PennySpeech from "./PennySpeech";

interface Scene1Props {
  onComplete: () => void;
}

// Explore: learner picks any cake size and shades freely.
// Challenge: each challenge specifies the cake size (denominator) and target slices to serve.
// Intentionally avoid leading with 1/2 — start with sixths, mix denominators.
const challenges = [
  { numerator: 5, denominator: 6, label: "5/6" },
  { numerator: 1, denominator: 3, label: "1/3" },
  { numerator: 3, denominator: 4, label: "3/4" },
  { numerator: 3, denominator: 8, label: "3/8" },
  { numerator: 2, denominator: 6, label: "2/6" },
  { numerator: 5, denominator: 8, label: "5/8" },
  { numerator: 2, denominator: 3, label: "2/3" },
  { numerator: 1, denominator: 4, label: "1/4" },
];

const exploreSizes = [4, 6, 8];

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

// Build SVG path for a pie slice from angle a1 to a2 (radians) at radius r centered on (cx,cy).
const slicePath = (cx: number, cy: number, r: number, a1: number, a2: number) => {
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy + r * Math.sin(a2);
  const largeArc = a2 - a1 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

const BakeryScene1 = ({ onComplete }: Scene1Props) => {
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [exploreDen, setExploreDen] = useState(6); // start at sixths, not halves
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);
  const [shaded, setShaded] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[challengeIdx];
  const denominator = phase === "explore" ? exploreDen : challenge.denominator;
  const { numerator, label } = challenge;

  const newChallenge = useCallback(() => {
    const { idx } = pickRandom(challenges, lastChallengeIdx);
    setChallengeIdx(idx);
    setLastChallengeIdx(idx);
    setShaded(new Set());
    setFeedback("");
    setShowHint(false);
    setPhase("challenge");
  }, [lastChallengeIdx]);

  // Reset shading whenever the visible cake size changes.
  useEffect(() => {
    setShaded(new Set());
    setFeedback("");
  }, [denominator]);

  const slices = useMemo(() => {
    const cx = 100;
    const cy = 100;
    const r = 88;
    const step = (Math.PI * 2) / denominator;
    return Array.from({ length: denominator }, (_, i) => {
      const a1 = -Math.PI / 2 + i * step;
      const a2 = a1 + step;
      const midA = a1 + step / 2;
      return {
        idx: i,
        d: slicePath(cx, cy, r, a1, a2),
        labelX: cx + (r * 0.6) * Math.cos(midA),
        labelY: cy + (r * 0.6) * Math.sin(midA),
      };
    });
  }, [denominator]);

  const toggleSlice = (i: number) => {
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
    if (shaded.size === numerator) {
      setFeedback(
        `Perfect! You shaded ${numerator} of ${denominator} slices — that's ${label} of the cake.`,
      );
      setPhase("done");
    } else if (shaded.size < numerator) {
      setFeedback(`Almost! You need ${numerator - shaded.size} more shaded slice${numerator - shaded.size === 1 ? "" : "s"} to make ${label}.`);
    } else {
      setFeedback(`That's too many! Remove ${shaded.size - numerator} slice${shaded.size - numerator === 1 ? "" : "s"} to show ${label}.`);
    }
  };

  return (
    <section
      className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto"
      aria-labelledby="bakery-scene1-heading"
    >
      <h2 id="bakery-scene1-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">🍰 </span>Slice the Cake
      </h2>

      <PennySpeech
        text={
          phase === "explore"
            ? "Let's play with cakes first! Pick how many slices the cake has, then tap slices to shade them. Watch how the fraction below changes — bottom is the total, top is what you shaded."
            : phase === "challenge"
            ? `A customer ordered ${label} of a cake! The cake has ${denominator} slices — tap slices to shade them. Show ${numerator} out of ${denominator}.`
            : `You got it! Bottom number = total slices. Top number = how many you served. That's a fraction!`
        }
      />

      {phase === "explore" && (
        <div className="flex flex-wrap items-center justify-center gap-2 bg-card border border-bakery-frosting-deep/20 rounded-xl p-2">
          <span className="text-sm text-muted-foreground">Cake size:</span>
          {exploreSizes.map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={exploreDen === n ? "default" : "outline"}
              onClick={() => setExploreDen(n)}
              aria-pressed={exploreDen === n}
              className={exploreDen === n ? "bg-bakery-frosting-deep text-accent-foreground" : ""}
            >
              {n} slices
            </Button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {phase === "explore" ? (
            <>
              Your fraction:{" "}
              <span className="font-bold text-foreground text-base">
                {shaded.size}/{denominator}
              </span>
            </>
          ) : (
            <>
              Target: <span className="font-bold text-foreground text-base">{label}</span>
              {" "}— shaded:{" "}
              <span className="font-semibold text-foreground">
                {shaded.size}/{denominator}
              </span>
            </>
          )}
        </p>

        <svg
          viewBox="0 0 200 200"
          className="w-56 h-56 md:w-64 md:h-64 drop-shadow-md"
          role="group"
          aria-label={`Round cake divided into ${denominator} equal slices. ${shaded.size} shaded.`}
        >
          {/* Cake plate */}
          <circle cx="100" cy="100" r="94" fill="hsl(var(--bakery-tray))" opacity="0.4" />
          {slices.map((s) => {
            const isShaded = shaded.has(s.idx);
            return (
              <g key={s.idx}>
                <path
                  d={s.d}
                  fill={isShaded ? "hsl(var(--bakery-frosting))" : "hsl(var(--bakery-cream))"}
                  stroke="hsl(var(--bakery-chocolate))"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors duration-200 hover:opacity-80 focus:outline-none"
                  onClick={() => toggleSlice(s.idx)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isShaded}
                  aria-label={`Slice ${s.idx + 1} of ${denominator}, ${isShaded ? "shaded" : "not shaded"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSlice(s.idx);
                    }
                  }}
                />
                {isShaded && (
                  <text
                    x={s.labelX}
                    y={s.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="hsl(var(--bakery-chocolate))"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    🍓
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="sr-only" aria-live="polite">
          {shaded.size} of {denominator} slices shaded.
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
          <Button onClick={handleCheck}>Check My Slices</Button>
        </div>
      )}

      {showHint && phase === "challenge" && (
        <p
          className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in"
          role="status"
        >
          The fraction <span className="font-semibold">{label}</span> means {numerator} out of {denominator}. Shade exactly {numerator} slice{numerator === 1 ? "" : "s"}.
        </p>
      )}

      {phase === "done" && (
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={newChallenge}>
            Try Another Order
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

export default BakeryScene1;
