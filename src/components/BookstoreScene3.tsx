import BuildAndSort, { type Round, type ShopTheme } from "./templates/BuildAndSort";
import sceneData from "@/content/bookstore/scene3.json";

interface Scene3Props {
  onComplete: () => void;
}

const BookstoreScene3 = ({ onComplete }: Scene3Props) => (
  <BuildAndSort
    rounds={sceneData.rounds as Round[]}
    skillLabel={sceneData.skillLabel}
    heading={sceneData.heading}
    shopTheme={sceneData.shopTheme as ShopTheme}
    onComplete={onComplete}
  />
);

export default BookstoreScene3;
