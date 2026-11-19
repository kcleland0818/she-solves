import SpinnerProbability from "./templates/SpinnerProbability";
import data from "@/content/arcade/scene1.json";
import type { SpinnerProblem } from "@/content/generators/probability";

const ArcadeScene1 = ({ onComplete }: { onComplete: () => void }) => (
  <SpinnerProbability {...data} problems={data.problems as SpinnerProblem[]} onComplete={onComplete} />
);
export default ArcadeScene1;
