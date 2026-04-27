import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PennySpeech from "./PennySpeech";
import averyAvatar from "@/assets/avery-avatar.png";
import mayaAvatar from "@/assets/maya-avatar.webp";

interface Scene3Props {
  onComplete: () => void;
}

// Two customer orders — Penny asks which order is bigger so the bakery charges fairly.
// Bakery framing: each "order" = a portion of a finished pastry tray.
const challenges = [
  { a: { num: 2, den: 3 }, b: { num: 3, den: 4 } }, // → b
  { a: { num: 3, den: 5 }, b: { num: 1, den: 2 } }, // → a
  { a: { num: 5, den: 8 }, b: { num: 3, den: 4 } }, // → b
  { a: { num: 2, den: 5 }, b: { num: 1, den: 3 } }, // → a
  { a: { num: 3, den: 8 }, b: { num: 1, den: 2 } }, // → b
  { a: { num: 5, den: 6 }, b: { num: 3, den: 4 } }, // → a
  { a: { num: 4, den: 6 }, b: { num: 2, den: 3 } }, // tie — both 2/3
  { a: { num: 2, den: 6 }, b: { num: 1, den: 4 } }, // → a (1/3 vs 1/4)
];

// Explore: pick any two fractions and compare.
const exploreOptions = [
  { num: 1, den: 2 },
  { num: 1, den: 3 },
  { num: 2, den: 3 },
  { num: 1, den: 4 },
  { num: 3, den: 4 },
  { num: 3, den: 8 },
  { num: 5, den: 8 },
  { num: 5, den: 6 },
];

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

const fmt = (f: { num: number; den: number }) => `${f.num}/${f.den}`;

interface FractionPastryProps {
  label: string;
  num: number;
  den: number;
  highlighted: "none" | "selected" | "winner";
  showProof: boolean;
  onClick?: () => void;
  ariaLabel: string;
  customerAvatar: string;
  customerName: string;
}

// Visualize each order as a strudel-style rectangular tray of pastries.
const FractionPastry = ({
  label,
  num,
  den,
  highlighted,
  showProof,
  onClick,
  ariaLabel,
  customerAvatar,
  customerName,
}: FractionPastryProps) => {
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
      <div className="flex items-center gap-2">
        <img
          src={customerAvatar}
          alt=""
          width={28}
          height={28}
          className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border border-bakery-frosting-deep/40 shadow-sm"
          aria-hidden="true"
        />
        <span className="sr-only">{customerName}: </span>
        <span className="text-2xl md:text-3xl font-bold text-foreground">{label}</span>
      </div>
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
          {num} of {den} pieces ordered
        </span>
      )}
    </button>
  );
};

const BakeryScene3 = ({ onComplete }: Scene3Props) => {
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [exploreAIdx, setExploreAIdx] = useState(0); // 1/2
  const [exploreBIdx, setExploreBIdx] = useState(2); // 2/3
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<"a" | "b" | "equal" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const challenge = challenges[challengeIdx];

  const isTie: boolean = useMemo(() => {
    const va = challenge.a.num / challenge.a.den;
    const vb = challenge.b.num / challenge.b.den;
    return Math.abs(va - vb) < 1e-9;
  }, [challenge]);

  const winner: "a" | "b" = useMemo(() => {
    const va = challenge.a.num / challenge.a.den;
    const vb = challenge.b.num / challenge.b.den;
    return va >= vb ? "a" : "b";
  }, [challenge]);

  const exploreA = exploreOptions[exploreAIdx];
  const exploreB = exploreOptions[exploreBIdx];
  const exploreCompare = useMemo(() => {
    const va = exploreA.num / exploreA.den;
    const vb = exploreB.num / exploreB.den;
    if (Math.abs(va - vb) < 1e-9) return "equal";
    return va > vb ? "a" : "b";
  }, [exploreA, exploreB]);

  const newChallenge = useCallback(() => {
    const { idx } = pickRandom(challenges, lastChallengeIdx);
    setChallengeIdx(idx);
    setLastChallengeIdx(idx);
    setSelected(null);
    setFeedback("");
    setShowHint(false);
    setPhase("challenge");
  }, [lastChallengeIdx]);

  const handlePick = (which: "a" | "b" | "equal") => {
    if (phase === "done") return;
    setSelected(which);
    const correct = isTie ? which === "equal" : which === winner;
    if (correct) {
      if (isTie) {
        setFeedback(
          `Tied! ${fmt(challenge.a)} and ${fmt(challenge.b)} are the same amount — both customers ordered equal portions.`,
        );
      } else {
        const w = challenge[winner];
        const l = challenge[winner === "a" ? "b" : "a"];
        setFeedback(
          `Correct! ${fmt(w)} is bigger than ${fmt(l)}. See how more of the tray is frosted?`,
        );
      }
      setPhase("done");
    } else if (which === "equal") {
      // Learner thought they were equal, but one is bigger.
      setFeedback("Not quite — look again. One tray actually has more pink filled in than the other.");
    } else if (isTie) {
      // Learner picked a side, but the trays are actually equal.
      setFeedback("Look closer — the trays might LOOK different, but they're actually the same amount. Try the \"They're equal!\" button.");
    } else {
      setFeedback("Not quite — look at the frosted trays again. Which one has MORE pink filled in?");
    }
  };

  return (
    <section
      className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto"
      aria-labelledby="bakery-scene3-heading"
    >
      <h2 id="bakery-scene3-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">🛎️ </span>Whose Order Is Bigger?
      </h2>

      <PennySpeech
        text={
          phase === "explore"
            ? `To compare fractions with different bottoms, give them a common denominator. ${fmt(exploreA)} = ${exploreA.num * exploreB.den}/${exploreA.den * exploreB.den} and ${fmt(exploreB)} = ${exploreB.num * exploreA.den}/${exploreA.den * exploreB.den} — now just compare the tops! ${exploreCompare === "equal" ? "These are equal." : `${exploreA.num * exploreB.den} ${exploreCompare === "a" ? ">" : "<"} ${exploreB.num * exploreA.den}, so ${fmt(exploreCompare === "a" ? exploreA : exploreB)} wins.`}`
            : phase === "challenge"
            ? `Two customers just placed orders! Compare ${fmt(challenge.a)} and ${fmt(challenge.b)} — tap the bigger order, or use "They're equal!" if they're the same.`
            : `Nice work! When the bottoms are different, you can't just compare the tops. The trays make it easy to SEE which is bigger.`
        }
      />

      {phase === "explore" && (
        <div className="grid grid-cols-2 gap-2 bg-card border border-bakery-frosting-deep/20 rounded-xl p-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <img src={mayaAvatar} alt="" width={16} height={16} className="w-4 h-4 rounded-full object-cover" aria-hidden="true" />
              Maya's order
            </span>
            <select
              value={exploreAIdx}
              onChange={(e) => setExploreAIdx(Number(e.target.value))}
              className="text-sm rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Maya's order fraction"
            >
              {exploreOptions.map((o, i) => (
                <option key={i} value={i}>
                  {fmt(o)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <img src={averyAvatar} alt="" width={16} height={16} className="w-4 h-4 rounded-full object-cover" aria-hidden="true" />
              Avery's order
            </span>
            <select
              value={exploreBIdx}
              onChange={(e) => setExploreBIdx(Number(e.target.value))}
              className="text-sm rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Avery's order fraction"
            >
              {exploreOptions.map((o, i) => (
                <option key={i} value={i}>
                  {fmt(o)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {phase === "explore" ? (
          <>
            <FractionPastry
              label={fmt(exploreA)}
              num={exploreA.num}
              den={exploreA.den}
              highlighted={exploreCompare === "a" ? "winner" : "none"}
              showProof
              ariaLabel={`Maya ordered ${fmt(exploreA)}`}
              customerAvatar={mayaAvatar}
              customerName="Maya"
            />
            <FractionPastry
              label={fmt(exploreB)}
              num={exploreB.num}
              den={exploreB.den}
              highlighted={exploreCompare === "b" ? "winner" : "none"}
              showProof
              ariaLabel={`Avery ordered ${fmt(exploreB)}`}
              customerAvatar={averyAvatar}
              customerName="Avery"
            />
          </>
        ) : (
          <>
            <FractionPastry
              label={fmt(challenge.a)}
              num={challenge.a.num}
              den={challenge.a.den}
              highlighted={
                phase === "done"
                  ? isTie || winner === "a"
                    ? "winner"
                    : "none"
                  : selected === "a"
                  ? "selected"
                  : "none"
              }
              showProof={phase === "done"}
              onClick={phase === "challenge" ? () => handlePick("a") : undefined}
              ariaLabel={`Choose ${fmt(challenge.a)}`}
              customerAvatar={mayaAvatar}
              customerName="Maya"
            />
            <FractionPastry
              label={fmt(challenge.b)}
              num={challenge.b.num}
              den={challenge.b.den}
              highlighted={
                phase === "done"
                  ? isTie || winner === "b"
                    ? "winner"
                    : "none"
                  : selected === "b"
                  ? "selected"
                  : "none"
              }
              showProof={phase === "done"}
              onClick={phase === "challenge" ? () => handlePick("b") : undefined}
              ariaLabel={`Choose ${fmt(challenge.b)}`}
              customerAvatar={averyAvatar}
              customerName="Avery"
            />
          </>
        )}
      </div>

      {phase === "challenge" && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => handlePick("equal")}
            aria-pressed={selected === "equal"}
            className={
              selected === "equal"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-bakery-frosting-deep/40"
            }
          >
            <span aria-hidden="true">⚖️ </span>They're equal!
          </Button>
        </div>
      )}

      {phase === "explore" && (
        <p className="text-center text-sm text-muted-foreground" aria-live="polite">
          {exploreCompare === "equal" ? (
            <>
              <span className="font-semibold text-foreground">{fmt(exploreA)}</span> and{" "}
              <span className="font-semibold text-foreground">{fmt(exploreB)}</span> are the same!
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {fmt(exploreCompare === "a" ? exploreA : exploreB)}
              </span>{" "}
              is bigger than{" "}
              <span className="font-semibold text-foreground">
                {fmt(exploreCompare === "a" ? exploreB : exploreA)}
              </span>
            </>
          )}
        </p>
      )}

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
          Take Real Orders! <span aria-hidden="true">🛎️</span>
        </Button>
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
          Look at the pink frosting in each tray. The one with MORE pink is the bigger order. You can also think: is each fraction more or less than 1/2?
        </p>
      )}

      {phase === "done" && (
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={newChallenge}>
            Next Customer Pair
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
