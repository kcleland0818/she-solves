import PredictionSimulator from "./templates/PredictionSimulator";
import data from "@/content/arcade/scene3.json";

const ArcadeScene3 = ({ onComplete }: { onComplete: () => void }) => (
  <PredictionSimulator {...data} onComplete={onComplete} />
);
export default ArcadeScene3;
