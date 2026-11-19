import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LucySpeech from "@/components/LucySpeech";
import SkillStamp from "@/components/SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import { countOf, simplify, type SpinnerProblem, type PrizeColor } from "@/content/generators/probability";

const COLOR_VAR: Record<PrizeColor, string> = {
  gold: "var(--arcade-gold)", red: "var(--arcade-red)", blue: "var(--arcade-blue)", green: "var(--arcade-green)",
};

export const Wheel = ({ sections, landed }: { sections: PrizeColor[]; landed: number | null }) => {
  const n = sections.length;
  const stops = sections.map((c, i) => `hsl(${COLOR_VAR[c]}) ${(i * 360) / n}deg ${((i + 1) * 360) / n - 1.5}deg, hsl(var(--arcade-deep)) ${((i + 1) * 360) / n - 1.5}deg ${((i + 1) * 360) / n}deg`).join(", ");
  const rotation = landed === null ? 0 : 1080 - ((landed + 0.5) * 360) / n;
  const counts = sections.reduce<Record<string, number>>((m, c) => ((m[c] = (m[c] ?? 0) + 1), m), {});
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="relative w-44 h-44">
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 z-10 text-2xl" aria-hidden="true">🔻</div>
        <div
          role="img"
          aria-label={`Prize wheel with ${n} equal sections: ${Object.entries(counts).map(([c, k]) => `${k} ${c}`).join(", ")}.`}
          className="w-full h-full rounded-full border-4 border-arcade-deep shadow-lg transition-transform duration-1000 ease-out"
          style={{ background: `conic-gradient(${stops})`, transform: `rotate(${rotation}deg)` }}
        />
      </div>
      <figcaption className="text-xs text-muted-foreground">{n} equal sections</figcaption>
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
      <Wheel sections={p.sections} landed={landed} />
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
