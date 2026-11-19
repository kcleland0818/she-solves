import { useState } from "react";
import { Button } from "@/components/ui/button";
import LucySpeech from "@/components/LucySpeech";
import SkillStamp from "@/components/SkillStamp";
import { celebratoryOpener, skillBeat } from "@/lib/celebrate";
import type { BagProblem, Likelihood } from "@/content/generators/probability";
import { cn } from "@/lib/utils";

export interface LikelihoodEvent { text: string; answer: Likelihood; hint: string }

const SCALE: { id: Likelihood; label: string }[] = [
  { id: "impossible", label: "Impossible" },
  { id: "unlikely", label: "Unlikely" },
  { id: "even", label: "Even chance" },
  { id: "likely", label: "Likely" },
  { id: "certain", label: "Certain" },
];

interface Props {
  events?: LikelihoodEvent[];
  bags: BagProblem[];
  heading: string;
  intro: string;
  skillLabel: string;
  nextLabel?: string;
  onComplete: () => void;
  onSolved?: () => void;
}

export const BagView = ({ label, prizes, total, prizeName }: { label: string; prizes: number; total: number; prizeName: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="text-3xl" aria-hidden="true">👜</div>
    <div className="font-semibold text-sm text-card-foreground">{label}</div>
    <div className="flex flex-wrap justify-center gap-1 max-w-[9rem]" role="img" aria-label={`${prizes} ${prizeName} out of ${total} tokens`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("w-4 h-4 rounded-full border border-border", i < prizes ? "bg-arcade-gold" : "bg-muted")} />
      ))}
    </div>
    <div className="text-xs text-muted-foreground">{prizes} of {total} are {prizeName}</div>
  </div>
);

const LikelihoodScale = ({ events = [], bags, heading, intro, skillLabel, nextLabel = "Next Scene →", onComplete, onSolved }: Props) => {
  const items = [...events.map((e) => ({ kind: "event" as const, e })), ...bags.map((b) => ({ kind: "bag" as const, b }))];
  const [idx, setIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState(intro);
  const item = items[idx];
  const last = idx === items.length - 1;

  const answerEvent = (choice: Likelihood) => {
    if (item.kind !== "event" || solved) return;
    if (choice === item.e.answer) {
      setSolved(true); onSolved?.();
      setFeedback(`${celebratoryOpener("arcade")} That's ${SCALE.find((s) => s.id === choice)!.label.toLowerCase()}.`);
    } else setFeedback(item.e.hint);
  };
  const answerBag = (choice: 0 | 1) => {
    if (item.kind !== "bag" || solved) return;
    const [a, b] = item.b.bags;
    if (choice === item.b.answer) {
      setSolved(true); onSolved?.();
      setFeedback(`${celebratoryOpener("arcade")} ${a.label} is ${a.prizes}/${a.total} and ${b.label} is ${b.prizes}/${b.total}. ${skillBeat(skillLabel)}`);
    } else setFeedback(`Hmm — more ${item.b.prizeName} doesn't always mean a better chance. Compare prizes out of the total in each bag.`);
  };
  const advance = () => {
    if (last) return onComplete();
    setIdx(idx + 1); setSolved(false);
    setFeedback(items[idx + 1].kind === "bag" ? "Now pick the bag that gives the best chance at a prize." : "Here's the next one!");
  };

  return (
    <section className="flex flex-col gap-4 max-w-lg mx-auto w-full" aria-label={heading}>
      <h2 className="text-2xl font-bold text-foreground text-center">{heading}</h2>
      <p className="text-center text-xs text-muted-foreground">Question {idx + 1} of {items.length}</p>
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        {item.kind === "event" ? (
          <>
            <p className="text-center font-medium text-card-foreground">{item.e.text}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="group" aria-label="Likelihood scale">
              {SCALE.map((s) => (
                <Button key={s.id} variant={solved && s.id === item.e.answer ? "default" : "outline"} className="min-h-11 text-xs px-2 whitespace-normal" onClick={() => answerEvent(s.id)}>
                  {s.label}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-center font-medium text-card-foreground">Which bag gives you the best chance of pulling out {item.b.prizeName}?</p>
            <div className="grid grid-cols-2 gap-3">
              {item.b.bags.map((bag, i) => (
                <button
                  key={bag.label}
                  type="button"
                  onClick={() => answerBag(i as 0 | 1)}
                  aria-label={`Choose ${bag.label}: ${bag.prizes} of ${bag.total} are ${item.b.prizeName}`}
                  className={cn("rounded-xl border-2 p-3 min-h-11 bg-background hover:border-arcade-neon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    solved && i === item.b.answer ? "border-arcade-neon" : "border-border")}
                >
                  <BagView {...bag} prizeName={item.b.prizeName} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <LucySpeech text={feedback} />
      {solved && (
        <div className="flex flex-col items-center gap-3">
          {last && <SkillStamp label={skillLabel} />}
          <Button className="min-h-11" onClick={advance}>{last ? nextLabel : "Next →"}</Button>
        </div>
      )}
    </section>
  );
};

export default LikelihoodScale;
