import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import NiaSpeech from "./NiaSpeech";

interface Scene3Props {
  onComplete: () => void;
}

// Compare two fractions; learner picks the bigger one. Visual proof rendered as horizontal bars.
const challenges = [
  { a: { num: 1, den: 2 }, b: { num: 1, den: 4 } }, // 1/2 vs 1/4
  { a: { num: 2, den: 3 }, b: { num: 3, den: 4 } }, // 2/3 vs 3/4 → b
  { a: { num: 1, den: 3 }, b: { num: 1, den: 2 } }, // → b
  { a: { num: 3, den: 5 }, b: { num: 1, den: 2 } }, // → a
  { a: { num: 5, den: 8 }, b: { num: 3, den: 4 } }, // → b
  { a: { num: 2, den: 5 }, b: { num: 1, den: 3 } }, // → a
  { a: { num: 3, den: 8 }, b: { num: 1, den: 2 } }, // → b
  { a: { num: 5, den: 6 }, b: { num: 3, den: 4 } }, // → a
];

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

const fmt = (f: { num: number; den: number }) => `${f.num}/${f.den}`;

interface FractionBarProps {
  label: string;
  num: number;
  den: number;
  highlighted: "none" | "selected" | "winner";
  showProof: boolean;
  onClick?: () => void;
  ariaLabel: string;
}

const FractionBar = ({ label, num, den, highlighted, showProof, onClick, ariaLabel }: FractionBarProps) => {
  const cells = Array.from({ length: den }, (_, i) => i < num);
  const ringClass =
    highlighted === "winner"
      ? "ring-4 ring-bakery-frosting-deep"
      : highlighted === "selected"
      ? "ring-2 ring-primary"
      : "ring-1 ring-border";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col items-center gap-2 bg-card rounded-2xl p-3 md:p-4 transition-all duration-200 ${ringClass} ${
        onClick ? "hover:scale-[1.02] cursor-pointer" : "cursor-default"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full`}
      aria-label={ariaLabel}
    >
      <span className="text-2xl md:text-3xl font-bold text-foreground">{label}</span>
      <div
        className="flex w-full h-10 md:h-12 rounded-lg overflow-hidden border-2 border-bakery-chocolate/40"
        aria-hidden="true"
      >
        {cells.map((filled, i) => (
          <div
            key={i}
            className="flex-1 border-r border-bakery-chocolate/30 last:border-r-0 transition-colors"
            style={{
              backgroundColor: filled
                ? "hsl(var(--bakery-frosting))"
                : "hsl(var(--bakery-cream))",
            }}
          />
        ))}
      </div>
      {showProof && (
        <span className="text-xs text-muted-foreground">
          {num} of {den} parts shaded
        </span>
      )}
    </button>
  );
};

const BakeryScene3 = ({ onComplete }: Scene3Props) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<"a" | "b" | null>(null);
  const [phase, setPhase] = useState<"challenge" | "done">("challenge");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[challengeIdx];

  const winner: "a" | "b" = useMemo(() => {
    const va = challenge.a.num / challenge.a.den;
    const vb = challenge.b.num / challenge.b.den;
    return va >= vb ? "a" : "b";
  }, [challenge]);

  const newChallenge = useCallback(() => {
    const { idx } = pickRandom(challenges, lastChallengeIdx);
    setChallengeIdx(idx);
    setLastChallengeIdx(idx);
    setSelected(null);
    setFeedback("");
    setShowHint(false);
    setPhase("challenge");
  }, [lastChallengeIdx]);

  const handlePick = (which: "a" | "b") => {
    if (phase === "done") return;
    setSelected(which);
    if (which === winner) {
      const w = challenge[winner];
      const l = challenge[winner === "a" ? "b" : "a"];
      setFeedback(
        `Correct! ${fmt(w)} is bigger than ${fmt(l)}. See how more of the bar is frosted?`,
      );
      setPhase("done");
    } else {
      setFeedback("Not quite — look at the frosted bars again. Which one has MORE pink filled in?");
    }
  };

  return (
    <section
      className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto"
      aria-labelledby="bakery-scene3-heading"
    >
      <h2 id="bakery-scene3-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">⚖️ </span>Which Slice Is Bigger?
      </h2>

      <NiaSpeech
        text={
          phase === "challenge"
            ? `Two customers ordered different desserts. Which fraction is BIGGER — ${fmt(challenge.a)} or ${fmt(challenge.b)}? Tap the bigger one!`
            : `Nice work! When the bottoms are different, you can't just compare the tops. The bars make it easy to SEE which is bigger.`
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <FractionBar
          label={fmt(challenge.a)}
          num={challenge.a.num}
          den={challenge.a.den}
          highlighted={
            phase === "done"
              ? winner === "a"
                ? "winner"
                : "none"
              : selected === "a"
              ? "selected"
              : "none"
          }
          showProof={phase === "done"}
          onClick={phase === "challenge" ? () => handlePick("a") : undefined}
          ariaLabel={`Choose ${fmt(challenge.a)}`}
        />
        <FractionBar
          label={fmt(challenge.b)}
          num={challenge.b.num}
          den={challenge.b.den}
          highlighted={
            phase === "done"
              ? winner === "b"
                ? "winner"
                : "none"
              : selected === "b"
              ? "selected"
              : "none"
          }
          showProof={phase === "done"}
          onClick={phase === "challenge" ? () => handlePick("b") : undefined}
          ariaLabel={`Choose ${fmt(challenge.b)}`}
        />
      </div>

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in" role="status" aria-live="polite">
          {feedback}
        </p>
      )}

      {phase === "challenge" && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}>
            {showHint ? "Hide Hint" : "Hint"}
          </Button>
        </div>
      )}

      {showHint && phase === "challenge" && (
        <p
          className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in"
          role="status"
        >
          Look at the pink frosting in each bar. The one with MORE pink is the bigger fraction. You can also think: is each fraction more or less than 1/2?
        </p>
      )}

      {phase === "done" && (
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={newChallenge}>
            Compare Another Pair
          </Button>
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-bakery-frosting-deep to-accent text-accent-foreground"
          >
            Finish Lesson <span aria-hidden="true">→</span>
          </Button>
        </div>
      )}
    </section>
  );
};

export default BakeryScene3;
