import { useState, useMemo, useEffect } from "react";
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

const Scene1Ratios = ({ onComplete }: Scene1Props) => {
  const [strawberry, setStrawberry] = useState(2);
  const [banana, setBanana] = useState(1);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");

  const challenge = useMemo(
    () => challenges[Math.floor(Math.random() * challenges.length)],
    // re-pick when entering challenge phase
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase === "challenge"]
  );

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
      setFeedback(`🎉 Perfect! ${ratioExplain} Same ratio, bigger cup!`);
      setPhase("done");
    } else if (total < challenge.minTotal) {
      setFeedback(`Almost! Make the cup bigger — you need at least ${challenge.minTotal} parts total 🥤`);
    } else {
      setFeedback(`Hmm, the taste changed! Keep the same ${challenge.label} ratio 🍓🍌`);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center">🍹 Mix the Perfect Smoothie</h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? "Drag the sliders to mix your smoothie! A ratio tells us how much of each ingredient to use compared to the others."
            : phase === "challenge"
            ? `A customer wants the SAME taste but in a BIGGER cup. ${challenge.desc}`
            : "You nailed it! When you multiply both parts of a ratio by the same number, the taste stays the same! 🧠"
        }
      />

      {/* Smoothie Glass Visual */}
      <div className="flex justify-center">
        <div className="w-24 h-40 rounded-b-3xl border-2 border-border bg-muted/30 relative overflow-hidden">
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

      {/* Sliders */}
      <div className="space-y-4 bg-card border rounded-xl p-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>🍓 Strawberry</span>
            <span className="font-bold">{strawberry} parts</span>
          </div>
          <Slider
            value={[strawberry]}
            onValueChange={([v]) => { setStrawberry(v); setFeedback(""); }}
            min={0}
            max={10}
            step={1}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>🍌 Banana</span>
            <span className="font-bold">{banana} parts</span>
          </div>
          <Slider
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
      </div>

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in">{feedback}</p>
      )}

      {phase === "explore" && (
        <Button onClick={() => { setPhase("challenge"); setStrawberry(challenge.ratio); setBanana(1); }} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
          Try the Challenge! 💪
        </Button>
      )}

      {phase === "challenge" && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
            {showHint ? "Hide Hint" : "💡 Hint"}
          </Button>
          <Button onClick={handleCheck}>Check My Answer</Button>
        </div>
      )}

      {showHint && phase === "challenge" && (
        <p className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in">
          Try multiplying both numbers by the same amount! Like {challenge.ratio}×2 = {challenge.ratio * 2} and 1×2 = 2 → that's {challenge.ratio * 2}:2, same taste! 🍓🍌
        </p>
      )}

      {phase === "done" && (
        <Button onClick={onComplete} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
          Next Scene →
        </Button>
      )}
    </div>
  );
};

export default Scene1Ratios;
