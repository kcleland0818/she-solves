import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import MayaSpeech from "../MayaSpeech";
import SkillStamp from "../SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export type PieSlice = {
  name: string;
  value: number;
  emoji: string;
  color: string;
};

export type ShopTheme = "bookstore" | "bakery" | "smoothie";

interface PercentagesPieQuizProps {
  slices: PieSlice[];
  skillLabel: string;
  heading: string;
  unit: string;
  exploreIntro?: string;
  challengeIntro?: (label: string) => string;
  shopTheme?: ShopTheme;
  onComplete: () => void;
}

const pickRandom = <T,>(arr: T[], excludeIdx: number | null): { item: T; idx: number } => {
  const available = arr.map((item, i) => ({ item, i })).filter(({ i }) => i !== excludeIdx);
  const pick = available[Math.floor(Math.random() * available.length)];
  return { item: pick.item, idx: pick.i };
};

const PercentagesPieQuiz = ({
  slices,
  skillLabel,
  heading,
  unit,
  exploreIntro,
  challengeIntro,
  shopTheme = "smoothie",
  onComplete,
}: PercentagesPieQuizProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"explore" | "challenge" | "done">("explore");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [lastQuestionIdx, setLastQuestionIdx] = useState<number | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);

  const total = slices.reduce((s, d) => s + d.value, 0);
  const target = slices[questionIdx];
  const targetPercent = Math.round((target.value / total) * 100);

  const newQuestion = useCallback(() => {
    const { idx } = pickRandom(slices, lastQuestionIdx);
    setQuestionIdx(idx);
    setLastQuestionIdx(idx);
  }, [lastQuestionIdx, slices]);

  const checkAnswer = () => {
    const parsed = parseInt(answer);
    if (Math.abs(parsed - targetPercent) <= 1) {
      setFeedback(
        `${celebratoryOpener(shopTheme)} ${target.value} ÷ ${total} = ${(target.value / total).toFixed(2)}, and ${(target.value / total).toFixed(2)} × 100 = ${targetPercent}%. ${target.name} was about ${targetPercent}% of sales — ${skillBeat(skillLabel.toLowerCase())}`
      );
      setPhase("done");
    } else {
      setFeedback(`Not quite — try dividing ${target.name} sales by total sales, then multiply by 100!`);
    }
  };

  const exploreText =
    exploreIntro ??
    `Here's what we sold today! Tap on each item to see how many we sold. Percentage = (part ÷ whole) × 100`;
  const challengeText = challengeIntro
    ? challengeIntro(target.name)
    : `Pop quiz! What percentage of today's sales were ${target.name}?`;

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto" aria-labelledby="percentages-quiz-heading">
      <h2 id="percentages-quiz-heading" className="text-2xl font-bold text-center">
        {heading}
      </h2>

      <MayaSpeech
        text={
          phase === "explore"
            ? exploreText
            : phase === "challenge"
            ? challengeText
            : `That's right! ${target.value} out of ${total} = ${targetPercent}%. You're crushing it!`
        }
      />

      <div className="flex justify-center" aria-hidden="true">
        <div className="w-44 h-44">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={slices}
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
                {slices.map((s, i) => (
                  <Cell
                    key={i}
                    fill={s.color}
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

      <p className="sr-only">
        Today's sales totals: {slices.map(d => `${d.name} ${d.value} ${unit}`).join(', ')}. Total {total} {unit}. Use the buttons below to explore each item.
      </p>

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Sales data by item. Tab through to select.">
        {slices.map((d, i) => {
          const isActive = selected === i;
          return (
            <button
              key={d.name}
              onClick={() => setSelected(i)}
              aria-pressed={isActive}
              aria-label={`${d.name}: ${d.value} of ${total} ${unit}${isActive ? " (selected)" : ""}`}
              className="flex items-center gap-2 p-2 rounded-lg text-left text-sm bg-transparent transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div
                className={`rounded-full flex-shrink-0 transition-all duration-200 ${isActive ? "w-4 h-4" : "w-3 h-3"}`}
                style={{ backgroundColor: d.color }}
                aria-hidden="true"
              />
              <div>
                <span className={`transition-all duration-200 ${isActive ? "font-bold" : "font-medium"}`}>
                  <span aria-hidden="true">{d.emoji} </span>{d.name}
                </span>
                {isActive && (
                  <p className="text-xs text-muted-foreground animate-fade-in">
                    {d.value} of {total} {unit}
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
            What % of sales were {target.name}?
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
              {target.name} sold {target.value} {unit}. Total {unit} = {total}. Try: ({target.value} ÷ {total}) × 100
            </p>
          )}
        </div>
      )}

      {feedback && (
        <p className="text-center font-medium text-sm animate-fade-in" role="status" aria-live="polite">{feedback}</p>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-3">
          <SkillStamp label={skillLabel} />
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { newQuestion(); setPhase("challenge"); setAnswer(""); setFeedback(""); setShowHint(false); setSelected(null); }}>
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

export default PercentagesPieQuiz;
