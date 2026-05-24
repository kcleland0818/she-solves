import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MayaSpeech from "@/components/MayaSpeech";
import SkillStamp from "@/components/SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";

export interface RatioIngredient {
  name: string;
  emoji: string;
  /** CSS custom property name, e.g. "--smoothie-strawberry". */
  colorVar: string;
}

export interface RatioChallenge {
  /** Target ratio of A:B (e.g. 2 means 2:1). */
  ratio: number;
  label: string;
  minTotal: number;
  desc: string;
}

export interface RatioMixerProps {
  ingredientA: RatioIngredient;
  ingredientB: RatioIngredient;
  challenges: RatioChallenge[];
  skillLabel: string;
  onComplete: () => void;
  heading?: string;
  /** Theme key passed to celebratoryOpener. */
  theme?: "smoothie";
}

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

/**
 * Generic "scale a two-ingredient ratio" interaction template.
 * Replaces the bespoke Scene1Ratios with a data-driven component:
 * new ratio lessons = new JSON, not new TSX.
 */
const RatioMixer = ({
  ingredientA,
  ingredientB,
  challenges,
  skillLabel,
  onComplete,
  heading = "🍹 Mix the Perfect Smoothie",
  theme = "smoothie",
}: RatioMixerProps) => {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const challenge = challenges[challengeIdx];

  const newChallenge = useCallback(() => {
    const { idx } = pickRandom(challenges, lastChallengeIdx);
    setChallengeIdx(idx);
    setLastChallengeIdx(idx);
  }, [lastChallengeIdx, challenges]);

  useEffect(() => {
    if (phase === "challenge") {
      setA(challenge.ratio);
      setB(1);
    }
  }, [phase, challenge]);

  const total = a + b;
  const aPct = total > 0 ? (a / total) * 100 : 0;
  const bPct = total > 0 ? (b / total) * 100 : 0;

  const isCorrectRatio = b > 0 && Math.abs(a / b - challenge.ratio) < 0.1;

  const handleCheck = () => {
    if (total >= challenge.minTotal && isCorrectRatio) {
      const ratioExplain =
        challenge.ratio === 1
          ? `${a}:${b} is equal parts — 1:1!`
          : `${a}:${b} is the same as ${challenge.label} because ${a} ÷ ${b} = ${(a / b).toFixed(0)}.`;
      setFeedback(
        `${celebratoryOpener(theme)} ${ratioExplain} Same ratio, bigger cup — ${skillBeat(skillLabel.toLowerCase())}`,
      );
      setPhase("done");
    } else if (total < challenge.minTotal) {
      setFeedback(`Almost! Make the cup bigger — you need at least ${challenge.minTotal} parts total.`);
    } else {
      setFeedback(`Hmm, the taste changed! Keep the same ${challenge.label} ratio.`);
    }
  };

  const aId = `ingredient-a-slider`;
  const bId = `ingredient-b-slider`;

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="ratio-mixer-heading">
      <h2 id="ratio-mixer-heading" className="text-2xl font-bold text-center">
        {heading}
      </h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? "Drag the sliders to mix your smoothie! A ratio tells us how much of each ingredient to use compared to the others."
            : phase === "challenge"
            ? `A customer wants the SAME taste but in a BIGGER cup. ${challenge.desc}`
            : "You nailed it! When you multiply both parts of a ratio by the same number, the taste stays the same!"
        }
      />

      {/* Glass Visual */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="w-20 h-28 rounded-b-3xl border-2 border-border bg-muted/30 relative overflow-hidden">
          {total > 0 && (
            <>
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{ height: `${bPct}%`, backgroundColor: `hsl(var(${ingredientB.colorVar}))` }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{ height: `${aPct}%`, bottom: `${bPct}%`, backgroundColor: `hsl(var(${ingredientA.colorVar}))` }}
              />
            </>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold bg-background/70 px-2 py-0.5 rounded">
              {a}:{b}
            </span>
          </div>
        </div>
      </div>

      {/* Live region */}
      <div className="sr-only" aria-live="polite">
        Ratio: {a} to {b}. {Math.round(aPct)}% {ingredientA.name.toLowerCase()}.
      </div>

      {/* Sliders */}
      <fieldset className="space-y-3 bg-card border rounded-xl p-3">
        <legend className="sr-only">Smoothie ingredient sliders. Use left and right arrow keys to adjust.</legend>
        <p id="slider-hint" className="sr-only">
          Use left and right arrow keys to change by 1 part. Page Up and Page Down for larger jumps. Home and End for minimum and maximum.
        </p>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor={aId} id="ingredient-a-label">
              <span aria-hidden="true">{ingredientA.emoji} </span>{ingredientA.name}
            </label>
            <span className="font-bold" aria-live="polite">{a} parts</span>
          </div>
          <Slider
            id={aId}
            aria-labelledby="ingredient-a-label"
            aria-describedby="slider-hint"
            aria-valuetext={`${a} parts of ${ingredientA.name.toLowerCase()}`}
            value={[a]}
            onValueChange={([v]) => { setA(v); setFeedback(""); }}
            min={0}
            max={10}
            step={1}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor={bId} id="ingredient-b-label">
              <span aria-hidden="true">{ingredientB.emoji} </span>{ingredientB.name}
            </label>
            <span className="font-bold" aria-live="polite">{b} parts</span>
          </div>
          <Slider
            id={bId}
            aria-labelledby="ingredient-b-label"
            aria-describedby="slider-hint"
            aria-valuetext={`${b} parts of ${ingredientB.name.toLowerCase()}`}
            value={[b]}
            onValueChange={([v]) => { setB(v); setFeedback(""); }}
            min={0}
            max={10}
            step={1}
          />
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Ratio: <span className="font-semibold text-foreground">{a} : {b}</span>
          {total > 0 && (
            <> — that's <span className="font-semibold text-foreground">{Math.round(aPct)}%</span> {ingredientA.name.toLowerCase()}</>
          )}
        </p>
      </fieldset>

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in" role="status" aria-live="polite">{feedback}</p>
      )}

      {phase === "explore" && (
        <Button onClick={() => { newChallenge(); setPhase("challenge"); }} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
          Try the Challenge! <span aria-hidden="true">💪</span>
        </Button>
      )}

      {phase === "challenge" && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}>
            {showHint ? "Hide Hint" : "Hint"}
          </Button>
          <Button onClick={handleCheck}>Check My Answer</Button>
        </div>
      )}

      {showHint && phase === "challenge" && (
        <p className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in" role="status">
          Try multiplying both numbers by the same amount! Like {challenge.ratio}×2 = {challenge.ratio * 2} and 1×2 = 2 — that's {challenge.ratio * 2}:2, same taste!
        </p>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3">
          <SkillStamp label={skillLabel} />
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { newChallenge(); setPhase("challenge"); setFeedback(""); setShowHint(false); }}>
              Try a Different Challenge
            </Button>
            <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-accent text-accent-foreground">
              Next Scene <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default RatioMixer;
