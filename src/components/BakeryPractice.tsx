import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import SlicePicker from "./templates/SlicePicker";
import { generateFractionLesson } from "@/content/generators/fractionIdentification";
import { markPracticeRound } from "@/lib/progress";

const rollSeed = () => Math.floor(Math.random() * 2 ** 31);

interface BakeryPracticeProps {
  /** Return to the completion/wrap-up screen. */
  onExitPractice: () => void;
}

/**
 * Endless practice mode for fraction identification.
 * Each seed deals a brand-new challenge bank via the procedural generator;
 * "New Challenge" re-rolls the seed for a fresh set of customer orders.
 */
const BakeryPractice = ({ onExitPractice }: BakeryPracticeProps) => {
  const [seed, setSeed] = useState(rollSeed);
  const lesson = useMemo(() => generateFractionLesson({ seed }), [seed]);

  return (
    <section className="flex flex-col gap-3 max-w-lg mx-auto" aria-label="Fraction practice mode">
      <SlicePicker
        key={seed}
        exploreSizes={lesson.exploreSizes}
        challenges={lesson.challenges}
        skillLabel={lesson.skillLabel}
        startPhase="challenge"
        completeLabel="Back to Wrap-Up"
        heading="🔁 Practice Mode"
        onComplete={onExitPractice}
        onSolved={() => markPracticeRound("bakery")}
      />
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setSeed(rollSeed())}>
          New Challenge <span aria-hidden="true">🔀</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onExitPractice}>
          Back to Wrap-Up
        </Button>
      </div>
    </section>
  );
};

export default BakeryPractice;
