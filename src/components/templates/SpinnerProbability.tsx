import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LucySpeech from "@/components/LucySpeech";
import SkillStamp from "@/components/SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import { countOf, simplify, type SpinnerProblem, type PrizeColor } from "@/content/generators/probability";

const PRIZE_ORDER: PrizeColor[] = ["gold", "red", "blue", "green"];

const SYMBOL: Record<PrizeColor, string> = { gold: "★", red: "●", blue: "▲", green: "■" };

export const Wheel = ({ sections, landed, rotation }: { sections: PrizeColor[]; landed: number | null; rotation: number }) => {
  const n = sections.length;
  const R = 100, C = 110;
  const pt = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  };
  const counts = sections.reduce<Record<string, number>>((m, c) => ((m[c] = (m[c] ?? 0) + 1), m), {});
  const used = PRIZE_ORDER.filter((c) => counts[c]);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 220 220" aria-hidden="true" className="absolute left-1/2 -top-5 -translate-x-1/2 z-10 w-14 h-14 overflow-visible drop-shadow-md">
          <polygon points="70,10 150,10 110,85" fill="hsl(var(--arcade-gold))" stroke="hsl(var(--card))" strokeWidth="12" strokeLinejoin="round" />
        </svg>
        <svg
          viewBox="0 0 220 220"
          role="img"
          aria-label={`Prize wheel with ${n} equal sections: ${Object.entries(counts).map(([c, k]) => `${k} ${c}`).join(", ")}.${landed !== null ? ` Landed on ${sections[landed]}.` : ""}`}
          className="w-full h-full drop-shadow-lg transition-transform duration-1000 ease-out motion-reduce:transition-none"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle cx={C} cy={C} r={R + 6} fill="hsl(var(--arcade-deep))" />
          {sections.map((c, i) => {
            const a0 = (i * 360) / n, a1 = ((i + 1) * 360) / n;
            const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
            const [lx, ly] = pt((a0 + a1) / 2, R * 0.66);
            return (
              <g key={i}>
                <path d={`M${C},${C} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`} fill={`hsl(var(--arcade-${c}))`}
                  stroke="hsl(var(--card))" strokeWidth="4" strokeLinejoin="round" />
                <circle cx={lx} cy={ly} r="12" fill="hsl(0 0% 100%)" stroke={`hsl(var(--arcade-${c}))`} strokeWidth="3" />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold" fill="hsl(var(--arcade-deep))">{SYMBOL[c]}</text>
              </g>
            );
          })}
          <circle cx={C} cy={C} r="12" fill="hsl(var(--card))" stroke="hsl(var(--arcade-deep))" strokeWidth="3" />
        </svg>
      </div>
      <figcaption className="text-sm text-foreground flex flex-wrap justify-center gap-x-3 gap-y-1">
        <span className="text-muted-foreground">{n} equal sections:</span>
        {used.map((c) => (
          <span key={c} className="inline-flex items-center gap-1">
            <span aria-hidden="true" className="inline-flex w-5 h-5 items-center justify-center rounded-full border-2 bg-white text-xs font-bold text-arcade-deep" style={{ borderColor: `hsl(var(--arcade-${c}))` }}>{SYMBOL[c]}</span>
            {c} ({counts[c]})
          </span>
        ))}
      </figcaption>
    </figure>
  );
};

interface Props {
  problems: SpinnerProblem[];
  heading: string;
  intro: string;
  skillLabel: string;
  nextLabel?: string;
  onComplete: () => void;
  onSolved?: () => void;
}

const SpinnerProbability = ({ problems, heading, intro, skillLabel, nextLabel = "Next Scene →", onComplete, onSolved }: Props) => {
  const [idx, setIdx] = useState(0);
  const [landed, setLanded] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinLog, setSpinLog] = useState<string[]>([]);
  const [step, setStep] = useState<"fraction" | "simplify" | "done">("fraction");
  const [num, setNum] = useState("");
  const [den, setDen] = useState("");
  const [feedback, setFeedback] = useState(intro);
  const p = problems[idx];
  const count = countOf(p);
  const total = p.sections.length;
  const [sn, sd] = simplify(count, total);
  const last = idx === problems.length - 1;

  const spin = () => {
    const i = Math.floor(Math.random() * total);
    setLanded(i);
    setSpinLog((l) => [...l.slice(-4), p.sections[i]]);
    // Accumulate rotation so every spin visibly turns the wheel forward,
    // even when it lands on the same section twice in a row.
    const target = ((-((i + 0.5) * 360) / total) % 360 + 360) % 360;
    setRotation((r) => {
      const current = ((r % 360) + 360) % 360;
      return r + 1080 + ((target - current + 360) % 360);
    });
  };

  const check = () => {
    const n = Number(num), d = Number(den);
    if (step === "fraction") {
      if (n === count && d === total) {
        if (sn !== count) {
          setStep("simplify"); setNum(""); setDen("");
          setFeedback(`${celebratoryOpener("arcade")} ${count} of ${total} sections are ${p.target}, so it's ${count}/${total}. Can you simplify it?`);
        } else {
          setStep("done"); onSolved?.();
          setFeedback(`${celebratoryOpener("arcade")} ${count}/${total} is already as simple as it gets. ${skillBeat(skillLabel)}`);
        }
      } else if (d !== total) {
        setFeedback(`Close! The bottom number is how many equal sections there are in total. Count them all.`);
      } else {
        setFeedback(`Almost — the top number is how many sections are ${p.target}. Count just those.`);
      }
    } else if (step === "simplify") {
      if (n === sn && d === sd) {
        setStep("done"); onSolved?.();
        setFeedback(`${celebratoryOpener("arcade")} ${count}/${total} = ${sn}/${sd}. ${skillBeat(skillLabel)}`);
      } else {
        setFeedback(`Try dividing the top and bottom by the same number. What number goes into both ${count} and ${total}?`);
      }
    }
  };

  const advance = () => {
    if (last) return onComplete();
    setIdx(idx + 1); setStep("fraction"); setNum(""); setDen(""); setLanded(null); setSpinLog([]);
    setFeedback("New wheel! Spin it if you like, then tell me the chance.");
  };

  return (
    <section className="flex flex-col gap-4 max-w-lg mx-auto w-full" aria-label={heading}>
      <h2 className="text-2xl font-bold text-foreground text-center">{heading}</h2>
      <p className="text-center text-xs text-muted-foreground">Wheel {idx + 1} of {problems.length}</p>
      <Wheel sections={p.sections} landed={landed} rotation={rotation} />
      <div className="flex flex-col items-center gap-1">
        <Button variant="outline" className="min-h-11" onClick={spin}>Spin <span aria-hidden="true">🎡</span></Button>
        {spinLog.length > 0 && (
          <p className="text-xs text-muted-foreground" aria-live="polite">Last spins: {spinLog.join(", ")}</p>
        )}
      </div>
      <LucySpeech text={feedback} />
      {step !== "done" ? (
        <form className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3" onSubmit={(e) => { e.preventDefault(); check(); }}>
          <p className="text-sm font-medium text-card-foreground text-center">
            {step === "fraction" ? `What's the chance of landing on ${p.target}?` : `Write ${count}/${total} in simplest form.`}
          </p>
          <div className="flex items-center gap-2">
            <Input aria-label="Top number" inputMode="numeric" className="w-20 text-center min-h-11" value={num} onChange={(e) => setNum(e.target.value)} />
            <span className="text-2xl text-foreground" aria-hidden="true">/</span>
            <Input aria-label="Bottom number" inputMode="numeric" className="w-20 text-center min-h-11" value={den} onChange={(e) => setDen(e.target.value)} />
          </div>
          <Button type="submit" className="min-h-11" disabled={!num || !den}>Check</Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <SkillStamp label={skillLabel} />
          <Button className="min-h-11" onClick={advance}>{last ? nextLabel : "Next wheel →"}</Button>
        </div>
      )}
    </section>
  );
};

export default SpinnerProbability;
