import LikelihoodScale, { type LikelihoodEvent } from "./templates/LikelihoodScale";
import data from "@/content/arcade/scene2.json";
import type { BagProblem } from "@/content/generators/probability";

const ArcadeScene2 = ({ onComplete }: { onComplete: () => void }) => (
  <LikelihoodScale {...data} events={data.events as LikelihoodEvent[]} bags={data.bags as BagProblem[]} onComplete={onComplete} />
);
export default ArcadeScene2;
