import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LucySpeech from "@/components/LucySpeech";
import SkillStamp from "@/components/SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import { mulberry32 } from "@/content/generators/mulberry32";

export interface ClawMachine {
  items: { emoji: string; name: string; count: number }[];
  target: string;
  plays: number;
  seed: number;
}

/** Deterministic simulated plays: each play grabs one plushie at random (with replacement). */
export const simulatePlays = (m: ClawMachine): number => {
  const rng = mulberry32(m.seed);
  const total = m.items.reduce((n, i) => n + i.count, 0);
  const target = m.items.find((i) => i.name === m.target)!.count;
  let wins = 0;
  for (let i = 0; i < m.plays; i++) if (rng() * total < target) wins++;
  return wins;
};
export const expectedWins = (m: ClawMachine) => {
  const total = m.items.reduce((n, i) => n + i.count, 0);
  return (m.plays * m.items.find((i) => i.name === m.target)!.count) / total;
};

const plural = (w: string) => (w.endsWith("s") ? `${w}es` : `${w}s`);

interface Props {
  machines: ClawMachine[];
  heading: string;
  intro: string;
  skillLabel: string;
  nextLabel?: string;
  onComplete: () => void;
}

const PredictionSimulator = ({ machines, heading, intro, skillLabel, nextLabel = "Finish →", onComplete }: Props) => {
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState("");
  const [predicted, setPredicted] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(intro);
  const m = machines[idx];
  const total = m.items.reduce((n, i) => n + i.count, 0);
  const targetCount = m.items.find((i) => i.name === m.target)!.count;
  const expected = expectedWins(m);
  const last = idx === machines.length - 1;

  const check = () => {
    if (Number(guess) === expected) {
      setPredicted(true);
      setFeedback(`${celebratoryOpener("arcade")} ${targetCount} of ${total} is ${targetCount}/${total}, and ${targetCount}/${total} of ${m.plays} plays is ${expected}. Let's play and see what really happens!`);
    } else {
      setFeedback(`Think of it this way: ${targetCount} out of every ${total} grabs is a ${m.target}. How many groups of ${total} fit into ${m.plays} plays?`);
    }
  };
  const run = () => {
    const wins = simulatePlays(m);
    setResult(wins);
    const diff = wins === expected ? "exactly what we predicted" : `${Math.abs(wins - expected)} ${wins > expected ? "more" : "fewer"} than we predicted`;
    setFeedback(`We won ${wins} ${plural(m.target)} — ${diff}. Real results bounce around, but probability tells us what to expect over many plays. ${skillBeat(skillLabel)}`);
  };
  const advance = () => {
    if (last) return onComplete();
    setIdx(idx + 1); setGuess(""); setPredicted(false); setResult(null);
    setFeedback("A new machine just got restocked! Make your forecast.");
  };

  return (
    <section className="flex flex-col gap-4 max-w-lg mx-auto w-full" aria-label={heading}>
      <h2 className="text-2xl font-bold text-foreground text-center">{heading}</h2>
      <p className="text-center text-xs text-muted-foreground">Machine {idx + 1} of {machines.length}</p>
      <LucySpeech text={feedback} />
      <div className="bg-card border-4 border-arcade-deep rounded-2xl p-4">
        <p className="text-sm font-semibold text-card-foreground text-center mb-2">Inside the claw machine ({total} plushies)</p>
        <ul className="flex flex-wrap justify-center gap-3" aria-label="Plushies in the machine">
          {m.items.map((it) => (
            <li key={it.name} className="flex flex-col items-center text-xs text-card-foreground">
              <span className="text-2xl" aria-hidden="true">{it.emoji.repeat(Math.min(it.count, 4))}</span>
              {it.count} {it.count === 1 ? it.name : plural(it.name)}
            </li>
          ))}
        </ul>
      </div>
      {!predicted ? (
        <form className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-3" onSubmit={(e) => { e.preventDefault(); check(); }}>
          <label htmlFor="forecast" className="text-sm font-medium text-card-foreground text-center">
            If you play {m.plays} times, about how many {plural(m.target)} should you expect to win?
          </label>
          <Input id="forecast" inputMode="numeric" className="w-24 text-center min-h-11" value={guess} onChange={(e) => setGuess(e.target.value)} />
          <Button type="submit" className="min-h-11" disabled={!guess}>Check</Button>
        </form>
      ) : result === null ? (
        <div className="flex justify-center"><Button className="min-h-11" onClick={run}>Play {m.plays} times <span aria-hidden="true">🕹️</span></Button></div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <dl className="grid grid-cols-2 gap-3 w-full text-center">
            <div className="bg-card border border-border rounded-xl p-3"><dt className="text-xs text-muted-foreground">Expected</dt><dd className="text-2xl font-bold text-card-foreground">{expected}</dd></div>
            <div className="bg-card border border-border rounded-xl p-3"><dt className="text-xs text-muted-foreground">Actually won</dt><dd className="text-2xl font-bold text-card-foreground">{result}</dd></div>
          </dl>
          <SkillStamp label={skillLabel} />
          <Button className="min-h-11" onClick={advance}>{last ? nextLabel : "Next machine →"}</Button>
        </div>
      )}
    </section>
  );
};

export default PredictionSimulator;
