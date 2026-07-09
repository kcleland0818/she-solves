import { useMemo } from "react";
import SlicePicker from "./templates/SlicePicker";
import { generateFractionLesson } from "@/content/generators/fractionIdentification";

interface Scene1Props {
  onComplete: () => void;
}

/**
 * Scene 1 challenges are now produced by the fraction generator with a pinned
 * seed — deterministic across deploys, no hand-authored JSON needed.
 */
const SCENE1_SEED = 42;

const BakeryScene1 = ({ onComplete }: Scene1Props) => {
  const lesson = useMemo(
    () => generateFractionLesson({ seed: SCENE1_SEED }),
    [],
  );

  return (
    <SlicePicker
      exploreSizes={lesson.exploreSizes}
      challenges={lesson.challenges}
      skillLabel={lesson.skillLabel}
      onComplete={onComplete}
    />
  );
};

export default BakeryScene1;
