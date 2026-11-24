import { useMemo } from "react";
import SpinnerProbability from "./templates/SpinnerProbability";
import data from "@/content/arcade/scene1.json";
import { generateProbabilityLesson } from "@/content/generators/probability";

const ArcadeScene1 = ({ onComplete }: { onComplete: () => void }) => {
  // Fresh wheels every visit: random seed per mount, so the sections and
  // the color asked about change each time a learner plays this scene.
  const seed = useMemo(() => Math.floor(Math.random() * 2 ** 31), []);
  const problems = useMemo(() => generateProbabilityLesson({ seed }).spinners, [seed]);
  return <SpinnerProbability {...data} problems={problems} onComplete={onComplete} />;
};
export default ArcadeScene1;
