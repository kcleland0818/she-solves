import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import AverySpeech from "../AverySpeech";
import SkillStamp from "../SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import { InequalityOp } from "../Inequality";

export type SentenceProblem = {
  sentence: string;
  variable: string;
  number: number;
  answer: InequalityOp;
  hint: string;
  range: [number, number];
  samples: number[];
};

export type ShopTheme = "bookstore" | "bakery" | "smoothie";

interface SentenceToInequalityProps {
  problems: SentenceProblem[];
  skillLabel: string;
  heading: string;
  intro?: string;
  nextLabel?: string;
  shopTheme?: ShopTheme;
  onComplete: () => void;
}

const SYM: Record<InequalityOp, string> = { lt: "<", gt: ">", eq: "=", lte: "≤", gte: "≥" };
const PHRASE: Record<InequalityOp, string> = {
  lt: "less than",
  gt: "greater than",
  lte: "less than or equal to",
  gte: "greater than or equal to",
  eq: "equals",
};

const OPTIONS: InequalityOp[] = ["lt", "lte", "gt", "gte"];

const evalOp = (a: number, op: InequalityOp, b: number) => {
  switch (op) {
    case "lt": return a < b;
    case "gt": return a > b;
    case "eq": return a === b;
    case "lte": return a <= b;
    case "gte": return a >= b;
  }
};

const THEME_CLASSES: Record<ShopTheme, { chip: string; accent: string; shade: string; marker: string; button: string }> = {
  bookstore: {
    chip: "bg-bookstore-parchment text-bookstore-ink dark:bg-muted dark:text-foreground",
    accent: "accent-bookstore-leather-deep",
    shade: "bg-bookstore-leather/40 dark:bg-bookstore-gold/40",
    marker: "border-bookstore-leather-deep",
    button: "bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white",
  },
  bakery: {
    chip: "bg-muted text-foreground",
    accent: "accent-primary",
    shade: "bg-primary/40",
    marker: "border-primary",
    button: "bg-gradient-to-r from-primary to-primary text-primary-foreground",
  },
  smoothie: {
    chip: "bg-muted text-foreground",
    accent: "accent-primary",
    shade: "bg-primary/40",
    marker: "border-primary",
    button: "bg-gradient-to-r from-primary to-primary text-primary-foreground",
  },
};

const NumberLine = ({
  min, max, threshold, op, variable, value, onValueChange, theme,
}: {
  min: number; max: number; threshold: number; op: InequalityOp | null; variable: string; value: number; onValueChange: (v: number) => void; theme: ShopTheme;
}) => {
  const span = max - min;
  const pct = (v: number) => ((v - min) / span) * 100;
  const tPct = pct(threshold);
  const vPct = pct(value);
  const t = THEME_CLASSES[theme];

  const shade =
    op === "lt" || op === "lte"
      ? { left: 0, width: tPct }
      : op === "gt" || op === "gte"
      ? { left: tPct, width: 100 - tPct }
      : null;

  const closed = op === "lte" || op === "gte";
  const ok = op ? evalOp(value, op, threshold) : null;
  const status = ok === null ? "no symbol picked yet" : ok ? "satisfies the inequality" : "does not satisfy the inequality";

  return (
    <div className="px-2 pt-8 pb-4">
      <div className="relative h-10">
        {shade && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${t.shade}`}
            style={{ left: `${shade.left}%`, width: `${shade.width}%` }}
            aria-hidden="true"
          />
        )}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-foreground/30" aria-hidden="true" />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${tPct}%` }}
          aria-hidden="true"
        >
          <div className={`w-4 h-4 rounded-full border-2 ${op ? t.marker : "border-foreground/50"} ${closed ? t.marker.replace("border-", "bg-") : "bg-background"}`} />
        </div>
        <div
          className="absolute -translate-x-1/2 -top-7 text-center pointer-events-none"
          style={{ left: `${vPct}%` }}
          aria-hidden="true"
        >
          <div
            className={`relative w-9 h-9 text-xs font-bold flex items-center justify-center transition-all ${
              ok === null
                ? "rounded-full bg-muted text-foreground border-2 border-border"
                : ok
                ? "rounded-full bg-foreground text-background border-2 border-foreground"
                : "rounded-sm bg-background text-foreground border-2 border-foreground"
            }`}
          >
            {value}
            {ok !== null && (
              <span
                className={`absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center border ${
                  ok
                    ? "bg-background text-foreground border-foreground"
                    : "bg-foreground text-background border-foreground"
                }`}
              >
                {ok ? "✓" : "✗"}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs text-muted-foreground mb-1 text-center">
          Drag to try a value for <span className="font-semibold text-foreground">{variable}</span> — currently {value} ({status})
        </label>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className={`w-full ${t.accent}`}
          aria-label={`Test value for ${variable}, currently ${value}, ${status}`}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
};

const DEFAULT_INTRO =
  "Pick the symbol that fits the sentence — the number line shades every value that works. Drag the slider to try different numbers and watch the ✓ or ✗.";

const SentenceToInequality = ({
  problems,
  skillLabel,
  heading,
  intro = DEFAULT_INTRO,
  nextLabel = "Continue",
  shopTheme = "bookstore",
  onComplete,
}: SentenceToInequalityProps) => {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<InequalityOp | null>(null);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);

  const problem = problems[idx];
  const isCorrect = picked === problem.answer;
  const allDone = useMemo(() => solved.size === problems.length, [solved, problems.length]);
  const t = THEME_CLASSES[shopTheme];

  const [testValue, setTestValue] = useState<number>(problem.number);

  const submit = (op: InequalityOp) => {
    setPicked(op);
    if (op === problem.answer) {
      setSolved((s) => new Set(s).add(idx));
    }
  };

  const next = () => {
    setPicked(null);
    setShowHint(false);
    const nextIdx = (idx + 1) % problems.length;
    setIdx(nextIdx);
    setTestValue(problems[nextIdx].number);
  };

  return (
    <section className="flex flex-col gap-3 animate-fade-in max-w-lg mx-auto w-full" aria-labelledby="sentence-to-inequality-heading">
      <h2 id="sentence-to-inequality-heading" className="text-2xl font-bold text-center">
        {heading}
      </h2>

      <AverySpeech text={intro} />

      <div className={`bg-card border ${shopTheme === "bookstore" ? "border-bookstore-leather/30" : "border-border"} rounded-2xl p-4 shadow-sm`}>
        <p className="text-center text-sm text-muted-foreground mb-2">
          Problem {idx + 1} of {problems.length} · solved {solved.size}/{problems.length}
        </p>
        <p className="text-center text-base text-foreground font-medium mb-3">
          “{problem.sentence}”
        </p>
        <div className="flex items-center justify-center gap-2 text-2xl font-bold flex-wrap">
          <span className={`px-3 py-1 rounded-md ${t.chip}`}>{problem.variable}</span>
          <span
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${t.chip} border-2 border-dashed ${shopTheme === "bookstore" ? "border-bookstore-leather/40" : "border-border"}`}
            aria-label={picked ? `symbol ${SYM[picked]}` : "missing symbol"}
          >
            {picked ? SYM[picked] : "?"}
          </span>
          <span className={`px-3 py-1 rounded-md ${t.chip}`}>{problem.number}</span>
        </div>

        <NumberLine
          min={problem.range[0]}
          max={problem.range[1]}
          threshold={problem.number}
          op={picked}
          variable={problem.variable}
          value={testValue}
          onValueChange={setTestValue}
          theme={shopTheme}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Choose an inequality symbol">
        {OPTIONS.map((op) => (
          <Button
            key={op}
            type="button"
            variant={picked === op ? "default" : "outline"}
            onClick={() => submit(op)}
            className="h-14 flex flex-col items-center justify-center gap-0"
            aria-label={`Pick ${PHRASE[op]}`}
          >
            <span className="text-xl font-bold">{SYM[op]}</span>
            <span className={`text-[10px] ${picked === op ? "opacity-90" : "text-muted-foreground"}`}>{PHRASE[op]}</span>
          </Button>
        ))}
      </div>

      {picked && (
        <p className="text-center font-medium text-sm" role="status" aria-live="polite">
          {isCorrect
            ? `${celebratoryOpener(shopTheme)} "${problem.variable} ${SYM[problem.answer]} ${problem.number}" — words → symbol. ${skillBeat(skillLabel.toLowerCase())}`
            : `Look at the number line — does the shaded region match what the sentence allows?`}
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        {allDone && <SkillStamp label={skillLabel} />}
        <div className="flex gap-2 justify-center flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint}>
            {showHint ? "Hide hint" : "Hint"}
          </Button>
          {picked && !isCorrect && (
            <Button variant="outline" size="sm" onClick={() => setPicked(null)}>Try again</Button>
          )}
          {isCorrect && !allDone && (
            <Button size="sm" onClick={next} className={t.button}>
              Next sentence <span aria-hidden="true">→</span>
            </Button>
          )}
          {allDone && (
            <Button size="sm" onClick={onComplete} className={t.button}>
              {nextLabel} <span aria-hidden="true">→</span>
            </Button>
          )}
        </div>
      </div>

      {showHint && (
        <p className="text-center text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3 animate-fade-in" role="status">
          {problem.hint}
        </p>
      )}
    </section>
  );
};

export default SentenceToInequality;
