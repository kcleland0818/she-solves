import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import SpinnerProbability from "./templates/SpinnerProbability";
import LikelihoodScale from "./templates/LikelihoodScale";
import { generateProbabilityLesson } from "@/content/generators/probability";
import { markPracticeRound } from "@/lib/progress";

const ArcadePractice = ({ onExitPractice }: { onExitPractice: () => void }) => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const [part, setPart] = useState<"spin" | "bags">("spin");
  const lesson = useMemo(() => generateProbabilityLesson({ seed }), [seed]);
  const fresh = () => { setSeed((s) => (s + 1) >>> 0); setPart("spin"); };
  return (
    <section className="flex flex-col gap-3 max-w-lg mx-auto w-full" aria-label="Probability practice mode">
      {part === "spin" ? (
        <SpinnerProbability key={`s${seed}`} problems={lesson.spinners} heading="🎡 Spinner Practice"
          intro="Fresh wheels just arrived! What's the chance of each color?" skillLabel="Probability of a Single Event"
          nextLabel="On to prize bags →" onComplete={() => setPart("bags")} onSolved={() => markPracticeRound("arcade")} />
      ) : (
        <LikelihoodScale key={`b${seed}`} bags={lesson.bags} heading="👜 Prize Bag Practice"
          intro="Which bag gives you the better chance?" skillLabel="Comparing Likelihood"
          nextLabel="Back to Wrap-Up" onComplete={onExitPractice} onSolved={() => markPracticeRound("arcade")} />
      )}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="outline" className="min-h-11" onClick={fresh}>New Challenge <span aria-hidden="true">🔀</span></Button>
        <Button variant="ghost" className="min-h-11" onClick={onExitPractice}>Back to Wrap-Up</Button>
      </div>
    </section>
  );
};
export default ArcadePractice;
