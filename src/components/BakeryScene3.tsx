import FractionCompare from "./templates/FractionCompare";
import sceneData from "@/content/bakery/scene3.json";
import averyAvatar from "@/assets/avery-avatar.png";
import mayaAvatar from "@/assets/maya-avatar.webp";

interface Scene3Props {
  onComplete: () => void;
}

/**
 * Thin wrapper: BakeryScene3 is now just data + the FractionCompare template.
 * Edit src/content/bakery/scene3.json to tweak options or challenge pairs.
 */
const BakeryScene3 = ({ onComplete }: Scene3Props) => (
  <FractionCompare
    exploreOptions={sceneData.exploreOptions}
    exploreStart={sceneData.exploreStart}
    challenges={sceneData.challenges}
    skillLabel={sceneData.skillLabel}
    customerA={{ name: "Maya", avatar: mayaAvatar }}
    customerB={{ name: "Avery", avatar: averyAvatar }}
    onComplete={onComplete}
  />
);

export default BakeryScene3;
