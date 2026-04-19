import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import MayaSpeech from "./MayaSpeech";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Scene2Props {
  onComplete: () => void;
}

const salesData = [
  { name: "Strawberry", value: 12, emoji: "🍓" },
  { name: "Mango", value: 8, emoji: "🥭" },
  { name: "Blueberry", value: 5, emoji: "💜" },
  { name: "Banana", value: 5, emoji: "🍌" },
];

const COLORS = [
  "hsl(350, 80%, 60%)",
  "hsl(35, 90%, 55%)",
  "hsl(240, 60%, 55%)",
  "hsl(45, 90%, 65%)",
];

const total = salesData.reduce((s, d) => s + d.value, 0);

const questions = [
  { index: 0, label: "Strawberry", emoji: "🍓" },
  { index: 1, label: "Mango", emoji: "🥭" },
  { index: 2, label: "Blueberry", emoji: "💜" },
  { index: 3, label: "Banana", emoji: "🍌" },
];

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

const Scene2Percentages = ({ onComplete }: Scene2Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [lastQuestionIdx, setLastQuestionIdx] = useState<number | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);

  const question = questions[questionIdx];

  const newQuestion = useCallback(() => {
    const { idx } = pickRandom(questions, lastQuestionIdx);
    setQuestionIdx(idx);
    setLastQuestionIdx(idx);
  }, [lastQuestionIdx]);

  const targetData = salesData[question.index];
  const targetPercent = Math.round((targetData.value / total) * 100);

  const checkAnswer = () => {
    const parsed = parseInt(answer);
    if (Math.abs(parsed - targetPercent) <= 1) {
      setFeedback(`Yes! ${targetData.value} ÷ ${total} = ${(targetData.value / total).toFixed(2)}, and ${(targetData.value / total).toFixed(2)} × 100 = ${targetPercent}%. ${question.label} was about ${targetPercent}% of sales!`);
      setPhase("done");
    } else {
      setFeedback(`Not quite — try dividing ${question.label} sales by total sales, then multiply by 100!`);
    }
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="scene2-heading">
      <h2 id="scene2-heading" className="text-2xl font-bold text-center">
        <span aria-hidden="true">📊 </span>Today's Sales
      </h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? "Here's what we sold today! Tap on each flavor to see how many we sold. Percentage = (part ÷ whole) × 100"
            : phase === "challenge"
            ? `Pop quiz! What percentage of today's sales were ${question.label}?`
            : `That's right! ${targetData.value} out of ${total} = ${targetPercent}%. You're crushing it!`
        }
      />

      {/* Pie Chart — decorative; data is conveyed via the legend buttons below */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="w-44 h-44">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={salesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={35}
                dataKey="value"
                onClick={(_, i) => setSelected(i)}
                cursor="pointer"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                isAnimationActive={false}
                tabIndex={-1}
              >
                {salesData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                    opacity={selected === null || selected === i ? 1 : 0.4}
                    className="transition-opacity duration-300"
                    tabIndex={-1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accessible data table — visible to screen readers, available via keyboard via the buttons below */}
      <p className="sr-only">
        Today's sales totals: {salesData.map(d => `${d.name} ${d.value} smoothies`).join(', ')}. Total {total} smoothies. Use the buttons below to explore each flavor.
      </p>

      {/* Legend / Details — primary keyboard-accessible control */}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Sales data by flavor. Tab through to select.">
        {salesData.map((d, i) => {
          const isActive = selected === i;
          return (
            <button
              key={d.name}
              onClick={() => setSelected(i)}
              aria-pressed={isActive}
              aria-label={`${d.name}: ${d.value} of ${total} smoothies${isActive ? " (selected)" : ""}`}
              className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-primary/20 shadow-md scale-110"
                  : "bg-transparent"
              }`}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} aria-hidden="true" />
              <div>
                <span className="font-medium"><span aria-hidden="true">{d.emoji} </span>{d.name}</span>
                {isActive && (
                  <p className="text-xs text-muted-foreground animate-fade-in">
                    {d.value} of {total} smoothies
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {phase === "explore" && (
        <Button onClick={() => { newQuestion(); setPhase("challenge"); }} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
          Try the Challenge! <span aria-hidden="true">💪</span>
        </Button>
      )}

      {phase === "challenge" && (
        <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-center" id="percentage-question">
            What % of sales were {question.label}?
          </p>
          <div className="flex gap-2 justify-center">
            <label htmlFor="percentage-answer" className="sr-only">Your answer in percent</label>
            <input
              id="percentage-answer"
              type="number"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setFeedback(""); }}
              placeholder="%"
              aria-describedby="percentage-question"
              className="w-20 text-center rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button onClick={checkAnswer} size="sm">Check</Button>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}>
              {showHint ? "Hide Hint" : "Hint"}
            </Button>
          </div>
          {showHint && (
            <p className="text-xs text-muted-foreground text-center animate-fade-in" role="status">
              {question.label} sold {targetData.value} smoothies. Total smoothies = {total}. Try: ({targetData.value} ÷ {total}) × 100
            </p>
          )}
        </div>
      )}

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in" role="status" aria-live="polite">{feedback}</p>
      )}

      {phase === "done" && (
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => { newQuestion(); setPhase("challenge"); setAnswer(""); setFeedback(""); setShowHint(false); setSelected(null); }}>
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

export default Scene2Percentages;
