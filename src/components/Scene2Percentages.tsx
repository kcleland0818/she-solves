import PercentagesPieQuiz, { type PieSlice } from "./templates/PercentagesPieQuiz";
import sceneData from "@/content/smoothie/scene2.json";

interface Scene2Props {
  onComplete: () => void;
}

const Scene2Percentages = ({ onComplete }: Scene2Props) => (
  <PercentagesPieQuiz
    slices={sceneData.slices as PieSlice[]}
    skillLabel={sceneData.skillLabel}
    heading={sceneData.heading}
    unit={sceneData.unit}
    shopTheme="smoothie"
    onComplete={onComplete}
  />
);

export default Scene2Percentages;
