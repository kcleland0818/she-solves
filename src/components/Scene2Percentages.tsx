import { useState } from "react";
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

const Scene2Percentages = ({ onComplete }: Scene2Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);

  const mangoPercent = Math.round((8 / total) * 100);

  const checkAnswer = () => {
    const parsed = parseInt(answer);
    if (Math.abs(parsed - mangoPercent) <= 1) {
      setFeedback("🎉 Yes! Mango was about " + mangoPercent + "% of sales! You're a natural!");
      setPhase("done");
    } else {
      setFeedback("Not quite — try dividing mango sales by total sales, then multiply by 100! 🤔");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center">📊 Today's Sales</h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? "Here's what we sold today! Tap on each flavor to see what percentage of sales it was. Percentage = (part ÷ whole) × 100 ✨"
            : phase === "challenge"
            ? "Pop quiz! What percentage of today's sales were Mango? 🥭"
            : `That's right! ${salesData[1].value} out of ${total} = ${mangoPercent}%. You're crushing it! 💪`
        }
      />

      {/* Pie Chart */}
      <div className="flex justify-center">
        <div className="w-56 h-56">
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
              >
                {salesData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                    opacity={selected === null || selected === i ? 1 : 0.4}
                    className="transition-opacity duration-300"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend / Details */}
      <div className="grid grid-cols-2 gap-2">
        {salesData.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          const isActive = selected === i;
          return (
            <button
              key={d.name}
              onClick={() => setSelected(i)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all duration-200 ${
                isActive ? "border-primary bg-primary/10 shadow-sm scale-[1.02]" : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <div>
                <span className="font-medium">{d.emoji} {d.name}</span>
                {isActive && (
                  <p className="text-xs text-muted-foreground animate-fade-in">
                    {d.value} of {total} = <span className="font-bold text-foreground">{pct}%</span>
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {phase === "explore" && (
        <Button onClick={() => setPhase("challenge")} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
          Try the Challenge! 💪
        </Button>
      )}

      {phase === "challenge" && (
        <div className="bg-card border border-primary/20 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-center">What % of sales were Mango? 🥭</p>
          <div className="flex gap-2 justify-center">
            <input
              type="number"
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setFeedback(""); }}
              placeholder="%"
              className="w-20 text-center rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <Button onClick={checkAnswer} size="sm">Check</Button>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
              {showHint ? "Hide Hint" : "💡 Hint"}
            </Button>
          </div>
          {showHint && (
            <p className="text-xs text-muted-foreground text-center animate-fade-in">
              Mango sold {salesData[1].value} cups. Total cups = {total}. Try: ({salesData[1].value} ÷ {total}) × 100
            </p>
          )}
        </div>
      )}

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in">{feedback}</p>
      )}

      {phase === "done" && (
        <Button onClick={onComplete} className="mx-auto bg-gradient-to-r from-primary to-accent text-accent-foreground">
          Next Scene →
        </Button>
      )}
    </div>
  );
};

export default Scene2Percentages;
