import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import RatioMixer from "./templates/RatioMixer";
import { generateRatioLesson } from "@/content/generators/ratioScaling";
import { markPracticeRound } from "@/lib/progress";

const SmoothiePractice = ({ onExitPractice }: { onExitPractice: () => void }) => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const lesson = useMemo(() => generateRatioLesson({ seed }), [seed]);
  const newChallenge = () => setSeed((previous) => {
    let next = previous;
    while (JSON.stringify(generateRatioLesson({ seed: next }).challenges) === JSON.stringify(lesson.challenges)) {
      next = (next + 1) >>> 0;
    }
    return next;
  });
  return (
    <section className="flex flex-col gap-3 max-w-lg mx-auto w-full" aria-label="Ratio practice mode">
      <RatioMixer key={seed} {...lesson} startPhase="challenge" heading="🍹 Ratio Practice"
        completeLabel="Back to Wrap-Up" onComplete={onExitPractice}
        onSolved={() => markPracticeRound("smoothie-shop")} />
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="outline" className="min-h-11" onClick={newChallenge}>New Challenge <span aria-hidden="true">🔀</span></Button>
        <Button variant="ghost" className="min-h-11" onClick={onExitPractice}>Back to Wrap-Up</Button>
      </div>
    </section>
  );
};
export default SmoothiePractice;