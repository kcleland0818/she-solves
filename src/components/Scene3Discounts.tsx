import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MayaSpeech from "./MayaSpeech";

interface Scene3Props {
  onComplete: () => void;
}

const smoothies = [
  { name: "Strawberry Blast", emoji: "🍓", price: 6 },
  { name: "Mango Sunrise", emoji: "🥭", price: 7 },
  { name: "Berry Royale", emoji: "🫐", price: 8 },
];

const Scene3Discounts = ({ onComplete }: Scene3Props) => {
  const [discount, setDiscount] = useState(0);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");

  const discountedPrice = (price: number) => price - (price * discount) / 100;

  // Challenge: set discount so $8 smoothie costs $6 → 25%
  const targetDiscount = 25;

  const handleCheck = () => {
    if (discount === targetDiscount) {
      setFeedback("🎉 YES! 25% off $8 = $6! You're a discount pro!");
      setPhase("done");
    } else {
      const result = discountedPrice(8).toFixed(2);
      setFeedback(`At ${discount}% off, the $8 smoothie costs $${result}. We need it to be $6! 🤔`);
    }
  };

  const mentalMathTip = () => {
    if (discount === 50) return '"50% is just half — easy!"';
    if (discount === 25) return '"25% is a quarter — divide by 4!"';
    if (discount === 10) return '"10% = move the decimal one spot left!"';
    return `"${discount}% of a price = price × ${discount}/100"`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center">🏷️ Discount Day!</h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? `It's sale day! Use the slider to set a discount and watch the prices change. ${mentalMathTip()}`
            : phase === "challenge"
            ? "Challenge: What discount makes the $8 Berry Royale cost exactly $6?"
            : "Amazing! 25% of $8 is $2, so $8 - $2 = $6. You've mastered discounts! 🎓"
        }
      />

      {/* Discount Slider */}
      <div className="bg-card border rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Discount</span>
          <span className="font-bold text-lg">{discount}% OFF</span>
        </div>
        <Slider
          value={[discount]}
          onValueChange={([v]) => { setDiscount(v); setFeedback(""); }}
          min={0}
          max={75}
          step={5}
        />
      </div>

      {/* Price Tags */}
      <div className="space-y-3">
        {smoothies.map((s) => {
          const newPrice = discountedPrice(s.price);
          const hasDiscount = discount > 0;
          return (
            <div
              key={s.name}
              className="flex items-center justify-between bg-card border rounded-xl px-4 py-3 transition-all duration-300"
            >
              <span className="font-medium">
                {s.emoji} {s.name}
              </span>
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="text-muted-foreground line-through text-sm">${s.price.toFixed(2)}</span>
                )}
                <span className={`font-bold text-lg transition-all duration-300 ${hasDiscount ? "text-accent" : ""}`}>
                  ${newPrice.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in">{feedback}</p>
      )}

      {phase === "explore" && (
        <Button onClick={() => { setPhase("challenge"); setDiscount(0); }} className="mx-auto">
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
          You need to take $2 off an $8 smoothie. What percentage is $2 of $8? Think: 2 ÷ 8 = ? 🤔
        </p>
      )}

      {phase === "done" && (
        <Button onClick={onComplete} className="mx-auto">
          See My Results! 🎉
        </Button>
      )}
    </div>
  );
};

export default Scene3Discounts;
