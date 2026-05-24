import RatioMixer from "./templates/RatioMixer";
import sceneData from "@/content/smoothie/scene1.json";

interface Scene1Props {
  onComplete: () => void;
}

/**
 * Thin wrapper: Scene1Ratios is now just data + the RatioMixer template.
 * To add a new ratio-scaling activity, edit
 * src/content/smoothie/scene1.json — no TSX changes needed.
 */
const Scene1Ratios = ({ onComplete }: Scene1Props) => (
  <RatioMixer
    ingredientA={sceneData.ingredientA}
    ingredientB={sceneData.ingredientB}
    challenges={sceneData.challenges}
    skillLabel={sceneData.skillLabel}
    onComplete={onComplete}
  />
);

export default Scene1Ratios;
