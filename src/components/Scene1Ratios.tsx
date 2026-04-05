import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MayaSpeech from "./MayaSpeech";

interface Scene1Props {
  onComplete: () => void;
}

const Scene1Ratios = ({ onComplete }: Scene1Props) => {
  const [strawberry, setStrawberry] = useState(2);
  const [banana, setBanana] = useState(1);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");

  const total = strawberry + banana;
  const strawberryPct = total > 0 ? (strawberry / total) * 100 : 0;
  const bananaPct = total > 0 ? (banana / total) * 100 : 0;

  // The original ratio is 2:1. Challenge: make a bigger cup (total >= 6) with same ratio
  const originalRatio = 2; // strawberry/banana
  const isCorrectRatio = banana > 0 && Math.abs(strawberry / banana - originalRatio) < 0.1;

  const handleCheck = () => {
    if (total >= 6 && isCorrectRatio) {
      setFeedback("🎉 Perfect! Same ratio, bigger cup! You totally get it!");
      setPhase("done");
    } else if (total < 6) {
      setFeedback("Almost! Make the cup bigger — try higher numbers 🥤");
    } else {
      setFeedback("Hmm, the taste changed! Keep the same 2:1 ratio 🍓🍌");
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
            ? "A customer wants the SAME taste but in a BIGGER cup (at least 6 parts total). Can you keep the 2:1 ratio?"
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
        <Button onClick={() => { setPhase("challenge"); setStrawberry(2); setBanana(1); }} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
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
          Try multiplying both numbers by the same amount! Like 2×2 = 4 and 1×2 = 2 → that's 4:2, same taste! 🍓🍌
        </p>
      )}

      {phase === "done" && (
        <Button onClick={onComplete} className="mx-auto">
          Next Scene →
        </Button>
      )}
    </div>
  );
};

export default Scene1Ratios;
