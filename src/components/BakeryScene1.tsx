import SlicePicker from "./templates/SlicePicker";
import sceneData from "@/content/bakery/scene1.json";

interface Scene1Props {
  onComplete: () => void;
}

/**
 * Thin wrapper: BakeryScene1 is now just data + the SlicePicker template.
 * To add a new fraction-identification activity, edit
 * src/content/bakery/scene1.json — no TSX changes needed.
 */
const BakeryScene1 = ({ onComplete }: Scene1Props) => (
  <SlicePicker
    exploreSizes={sceneData.exploreSizes}
    challenges={sceneData.challenges}
    skillLabel={sceneData.skillLabel}
    onComplete={onComplete}
  />
);

export default BakeryScene1;
