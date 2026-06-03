import FrostingTray from "./templates/FrostingTray";
import sceneData from "@/content/bakery/scene2.json";

interface Scene2Props {
  onComplete: () => void;
}

/**
 * Thin wrapper: BakeryScene2 is now just data + the FrostingTray template.
 * Edit src/content/bakery/scene2.json to tweak trays or challenges.
 */
const BakeryScene2 = ({ onComplete }: Scene2Props) => (
  <FrostingTray
    exploreTrays={sceneData.exploreTrays}
    exploreStartIdx={sceneData.exploreStartIdx}
    challenges={sceneData.challenges}
    skillLabel={sceneData.skillLabel}
    onComplete={onComplete}
  />
);

export default BakeryScene2;
