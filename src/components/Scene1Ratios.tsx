import { useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MayaSpeech from "./MayaSpeech";

interface Scene1Props {
  onComplete: () => void;
}

const challenges = [
  { ratio: 2, label: "2:1", minTotal: 6, desc: "Keep the 2:1 ratio but make at least 6 parts total!" },
  { ratio: 3, label: "3:1", minTotal: 8, desc: "Keep a 3:1 ratio with at least 8 parts total!" },
  { ratio: 1, label: "1:1", minTotal: 6, desc: "Make an equal mix (1:1) with at least 6 parts total!" },
  { ratio: 2, label: "2:1", minTotal: 9, desc: "Same 2:1 taste but in a HUGE cup — at least 9 parts!" },
];

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

const Scene1Ratios = ({ onComplete }: Scene1Props) => {
  const [strawberry, setStrawberry] = useState(2);
  const [banana, setBanana] = useState(1);
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
  }, [lastChallengeIdx]);

  useEffect(() => {
    if (phase === "challenge") {
      setStrawberry(challenge.ratio);
      setBanana(1);
    }
  }, [phase, challenge]);

  const total = strawberry + banana;
  const strawberryPct = total > 0 ? (strawberry / total) * 100 : 0;
  const bananaPct = total > 0 ? (banana / total) * 100 : 0;

  const isCorrectRatio =
    banana > 0 && Math.abs(strawberry / banana - challenge.ratio) < 0.1;

  const handleCheck = () => {
    if (total >= challenge.minTotal && isCorrectRatio) {
      const ratioExplain =
        challenge.ratio === 1
          ? `${strawberry}:${banana} is equal parts — 1:1!`
          : `${strawberry}:${banana} is the same as ${challenge.label} because ${strawberry} ÷ ${banana} = ${(strawberry / banana).toFixed(0)}.`;
      setFeedback(`Perfect! ${ratioExplain} Same ratio, bigger cup!`);
      setPhase("done");
    } else if (total < challenge.minTotal) {
      setFeedback(`Almost! Make the cup bigger — you need at least ${challenge.minTotal} parts total.`);
    } else {
      setFeedback(`Hmm, the taste changed! Keep the same ${challenge.label} ratio.`);
    }
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="scene1-heading">
      <h2 id="scene1-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">🍹 </span>Mix the Perfect Smoothie
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

      {/* Smoothie Glass Visual */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="w-20 h-28 rounded-b-3xl border-2 border-border bg-muted/30 relative overflow-hidden">
          {total > 0 && (
            <>
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{
                  height: `${bananaPct}%`,
                  backgroundColor: "hsl(var(--smoothie-banana))",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                style={{
                  height: `${strawberryPct}%`,
                  bottom: `${bananaPct}%`,
                  backgroundColor: "hsl(var(--smoothie-strawberry))",
                }}
              />
            </>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold bg-background/70 px-2 py-0.5 rounded">
              {strawberry}:{banana}
            </span>
          </div>
        </div>
      </div>

      {/* Live region for ratio announcement */}
      <div className="sr-only" aria-live="polite">
        Ratio: {strawberry} to {banana}. {Math.round(strawberryPct)}% strawberry.
      </div>

      {/* Sliders */}
      <fieldset className="space-y-3 bg-card border rounded-xl p-3">
        <legend className="sr-only">Smoothie ingredient sliders</legend>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor="strawberry-slider" id="strawberry-label">
              <span aria-hidden="true">🍓 </span>Strawberry
            </label>
            <span className="font-bold" aria-live="polite">{strawberry} parts</span>
          </div>
          <Slider
            id="strawberry-slider"
            aria-labelledby="strawberry-label"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={strawberry}
            aria-valuetext={`${strawberry} parts`}
            value={[strawberry]}
            onValueChange={([v]) => { setStrawberry(v); setFeedback(""); }}
            min={0}
            max={10}
            step={1}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <label htmlFor="banana-slider" id="banana-label">
              <span aria-hidden="true">🍌 </span>Banana
            </label>
            <span className="font-bold" aria-live="polite">{banana} parts</span>
          </div>
          <Slider
            id="banana-slider"
            aria-labelledby="banana-label"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={banana}
            aria-valuetext={`${banana} parts`}
            value={[banana]}
            onValueChange={([v]) => { setBanana(v); setFeedback(""); }}
            min={0}
            max={10}
            step={1}
          />
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Ratio: <span className="font-semibold text-foreground">{strawberry} : {banana}</span>
          {total > 0 && (
            <> — that's <span className="font-semibold text-foreground">{Math.round(strawberryPct)}%</span> strawberry</>
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
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { newChallenge(); setPhase("challenge"); setFeedback(""); setShowHint(false); }}>
            Try a Different Challenge
          </Button>
          <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-accent text-accent-foreground">
            Next Scene <span aria-hidden="true">→</span>
          </Button>
        </div>
      )}
    </section>
  );
};

export default Scene1Ratios;
