import SentenceToInequality, { type SentenceProblem } from "./templates/SentenceToInequality";
import sceneData from "@/content/bookstore/scene2.json";

interface Scene2Props {
  onComplete: () => void;
}

const BookstoreScene2 = ({ onComplete }: Scene2Props) => (
  <SentenceToInequality
    problems={sceneData.problems as SentenceProblem[]}
    skillLabel={sceneData.skillLabel}
    heading={sceneData.heading}
    nextLabel={sceneData.nextLabel}
    shopTheme="bookstore"
    onComplete={onComplete}
  />
);

export default BookstoreScene2;
