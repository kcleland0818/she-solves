import TrueFalseStatement, { type TFProblem } from "./templates/TrueFalseStatement";
import sceneData from "@/content/bookstore/scene1.json";

interface Scene1Props {
  onComplete: () => void;
}

const BookstoreScene1 = ({ onComplete }: Scene1Props) => (
  <TrueFalseStatement
    problems={sceneData.problems as TFProblem[]}
    skillLabel={sceneData.skillLabel}
    heading={sceneData.heading}
    shopTheme="bookstore"
    onComplete={onComplete}
  />
);

export default BookstoreScene1;
