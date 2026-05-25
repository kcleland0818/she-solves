import { useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MayaSpeech from "../MayaSpeech";
import SkillStamp from "../SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";

export interface DiscountItem {
  name: string;
  emoji: string;
  price: number;
}

export interface DiscountChallenge {
  itemIdx: number;
  targetPrice: number;
  targetDiscount: number;
  hint: string;
}

export type ShopTheme = "smoothie" | "bakery" | "bookstore";

interface DiscountCalculatorProps {
  items: DiscountItem[];
  challenges: DiscountChallenge[];
  skillLabel: string;
  heading: string;
  currency: string;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  exploreIntro?: string;
  doneText?: string;
  shopTheme?: ShopTheme;
  onComplete: () => void;
}

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

const DiscountCalculator = ({
  items,
  challenges,
  skillLabel,
  heading,
  currency,
  sliderMin = 0,
  sliderMax = 75,
  sliderStep = 5,
  exploreIntro,
  doneText = "Amazing! You've mastered discounts!",
  shopTheme = "smoothie",
  onComplete,
}: DiscountCalculatorProps) => {
  const [discount, setDiscount] = useState(0);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [lastChallengeIdx, setLastChallengeIdx] = useState<number | null>(null);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const challenge = challenges[challengeIdx];
  const targetItem = items[challenge.itemIdx];

  const newChallenge = useCallback(() => {
    const { idx } = pickRandom(challenges, lastChallengeIdx);
    setChallengeIdx(idx);
    setLastChallengeIdx(idx);
  }, [challenges, lastChallengeIdx]);

  const discountedPrice = (price: number) => price - (price * discount) / 100;

  const mentalMathTip = () => {
    if (discount === 50) return "50% is just half — easy!";
    if (discount === 25) return "25% is a quarter — divide by 4!";
    if (discount === 10) return "10% = move the decimal one spot left!";
    return `${discount}% of a price = price × ${discount}/100`;
  };

  const exploreSpeech = exploreIntro ?? `It's sale day! Use the slider to set a discount and watch the prices change. ${mentalMathTip()}`;
  const challengeSpeech = `Challenge: What discount makes the ${currency}${targetItem.price} ${targetItem.name} cost exactly ${currency}${challenge.targetPrice.toFixed(2)}?`;
  const doneSpeech = doneText;

  const handleCheck = () => {
    if (discount === challenge.targetDiscount) {
      const saved = (targetItem.price * challenge.targetDiscount) / 100;
      setFeedback(
        `${celebratoryOpener(shopTheme)} ${challenge.targetDiscount}% of ${currency}${targetItem.price} = ${currency}${targetItem.price} × ${challenge.targetDiscount}/100 = ${currency}${saved.toFixed(2)}. So ${currency}${targetItem.price} − ${currency}${saved.toFixed(2)} = ${currency}${challenge.targetPrice.toFixed(2)} — ${skillBeat(skillLabel.toLowerCase())}`
      );
      setPhase("done");
    } else {
      const result = discountedPrice(targetItem.price).toFixed(2);
      setFeedback(`At ${discount}% off, the ${currency}${targetItem.price} ${targetItem.name} costs ${currency}${result}. We need it to be ${currency}${challenge.targetPrice.toFixed(2)}!`);
    }
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="discount-heading">
      <h2 id="discount-heading" className="text-2xl font-bold text-center">
        {heading}
      </h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? exploreSpeech
            : phase === "challenge"
            ? challengeSpeech
            : doneSpeech
        }
      />

      {/* Discount Slider */}
      <fieldset className="bg-card border rounded-xl p-3">
        <legend className="sr-only">Set discount percentage. Use arrow keys to adjust by {sliderStep} percent.</legend>
        <p id="discount-hint" className="sr-only">
          Use left and right arrow keys to change by {sliderStep} percent. Home for {sliderMin} percent, End for {sliderMax} percent.
        </p>
        <div className="flex justify-between text-sm mb-2">
          <label htmlFor="discount-slider" id="discount-label">Discount</label>
          <span className="font-bold text-lg" aria-live="polite">{discount}% OFF</span>
        </div>
        <Slider
          id="discount-slider"
          aria-labelledby="discount-label"
          aria-describedby="discount-hint"
          aria-valuetext={`${discount} percent off`}
          value={[discount]}
          onValueChange={([v]) => { setDiscount(v); setFeedback(""); }}
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
        />
      </fieldset>

      {/* Price Tags */}
      <div className="space-y-2" role="list" aria-label="Item prices">
        {items.map((s) => {
          const newPrice = discountedPrice(s.price);
          const hasDiscount = discount > 1e-9;
          return (
            <div
              key={s.name}
              role="listitem"
              className="flex items-center justify-between bg-card border rounded-xl px-4 py-3 transition-all duration-300"
            >
              <span className="font-medium">
                <span aria-hidden="true">{s.emoji} </span>{s.name}
              </span>
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="text-muted-foreground line-through text-sm" aria-label={`Original price ${currency}${s.price.toFixed(2)}`}>
                    {currency}{s.price.toFixed(2)}
                  </span>
                )}
                <span
                  className={`font-bold text-lg transition-all duration-300 ${hasDiscount ? "text-accent" : ""}`}
                  aria-label={`${hasDiscount ? "Sale" : ""} price ${currency}${newPrice.toFixed(2)}`}
                >
                  {currency}{newPrice.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in" role="status" aria-live="polite">{feedback}</p>
      )}

      {phase === "explore" && (
        <Button onClick={() => { newChallenge(); setPhase("challenge"); setDiscount(0); }} className="mx-auto">
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
          {challenge.hint}
        </p>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3">
          <SkillStamp label={skillLabel} />
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { newChallenge(); setPhase("challenge"); setDiscount(0); setFeedback(""); setShowHint(false); }}>
              Try a Different Challenge
            </Button>
            <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-accent text-accent-foreground">
              See My Results! <span aria-hidden="true">🎉</span>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DiscountCalculator;
