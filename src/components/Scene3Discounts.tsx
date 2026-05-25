import DiscountCalculator, { type DiscountItem, type DiscountChallenge } from "./templates/DiscountCalculator";
import sceneData from "@/content/smoothie/scene3.json";

interface Scene3Props {
  onComplete: () => void;
}

const Scene3Discounts = ({ onComplete }: Scene3Props) => (
  <DiscountCalculator
    items={sceneData.items as DiscountItem[]}
    challenges={sceneData.challenges as DiscountChallenge[]}
    skillLabel={sceneData.skillLabel}
    heading={sceneData.heading}
    currency={sceneData.currency}
    sliderMin={sceneData.sliderMin}
    sliderMax={sceneData.sliderMax}
    sliderStep={sceneData.sliderStep}
    shopTheme="smoothie"
    onComplete={onComplete}
  />
);

export default Scene3Discounts;
