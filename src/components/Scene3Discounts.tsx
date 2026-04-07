import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MayaSpeech from "./MayaSpeech";

interface Scene3Props {
  onComplete: () => void;
}

const smoothies = [
  { name: "Strawberry Blast", emoji: "🍓", price: 6 },
  { name: "Mango Sunrise", emoji: "🥭", price: 7 },
  { name: "Blueberry Chill", emoji: "💜", price: 8 },
];

const challengeOptions = [
  { smoothieIdx: 2, targetPrice: 6, targetDiscount: 25, hint: "You need to take $2 off an $8 smoothie. What percentage is $2 of $8? Think: 2 ÷ 8 = ? 🤔" },
  { smoothieIdx: 0, targetPrice: 3, targetDiscount: 50, hint: "You need to cut a $6 smoothie in half. What percentage takes away half? 🤔" },
  { smoothieIdx: 1, targetPrice: 3.5, targetDiscount: 50, hint: "Half of $7 is $3.50. What discount gives you half off? 🤔" },
  { smoothieIdx: 2, targetPrice: 4, targetDiscount: 50, hint: "Half of $8 is $4. What's the discount for half price? 🤔" },
  { smoothieIdx: 0, targetPrice: 4.5, targetDiscount: 25, hint: "You need $1.50 off a $6 smoothie. $1.50 is what fraction of $6? 🤔" },
];

const Scene3Discounts = ({ onComplete }: Scene3Props) => {
  const [discount, setDiscount] = useState(0);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);

  const challenge = useMemo(() => {
    const available = challengeOptions.filter((_, i) => i !== lastChallengeIdx);
    const pick = available[Math.floor(Math.random() * available.length)];
    const idx = challengeOptions.indexOf(pick);
    setLastChallengeIdx(idx);
    return pick;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "challenge"]);

  const targetSmoothie = smoothies[challenge.smoothieIdx];

  const discountedPrice = (price: number) => price - (price * discount) / 100;

  const mentalMathTip = () => {
    if (discount === 50) return '"50% is just half — easy!"';
    if (discount === 25) return '"25% is a quarter — divide by 4!"';
    if (discount === 10) return '"10% = move the decimal one spot left!"';
    return `"${discount}% of a price = price × ${discount}/100"`;
  };

  const handleCheck = () => {
    if (discount === challenge.targetDiscount) {
      const saved = (targetSmoothie.price * challenge.targetDiscount / 100);
      setFeedback(`🎉 YES! ${challenge.targetDiscount}% of $${targetSmoothie.price} = $${targetSmoothie.price} × ${challenge.targetDiscount}/100 = $${saved.toFixed(2)}. So $${targetSmoothie.price} − $${saved.toFixed(2)} = $${challenge.targetPrice.toFixed(2)}! You're a discount pro!`);
      setPhase("done");
    } else {
      const result = discountedPrice(targetSmoothie.price).toFixed(2);
      setFeedback(`At ${discount}% off, the $${targetSmoothie.price} ${targetSmoothie.name} costs $${result}. We need it to be $${challenge.targetPrice.toFixed(2)}! 🤔`);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center">🏷️ Discount Day!</h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? `It's sale day! Use the slider to set a discount and watch the prices change. ${mentalMathTip()}`
            : phase === "challenge"
            ? `Challenge: What discount makes the $${targetSmoothie.price} ${targetSmoothie.name} cost exactly $${challenge.targetPrice.toFixed(2)}?`
            : `Amazing! You've mastered discounts! 🎓`
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
          {challenge.hint}
        </p>
      )}

      {phase === "done" && (
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { setPhase("challenge"); setDiscount(0); setFeedback(""); setShowHint(false); }}>
            Try a Different Challenge 🔄
          </Button>
          <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-accent text-accent-foreground">
            See My Results! 🎉
          </Button>
        </div>
      )}
    </div>
  );
};

export default Scene3Discounts;
