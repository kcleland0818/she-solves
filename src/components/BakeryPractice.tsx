import { useMemo } from "react";
import SlicePicker from "./templates/SlicePicker";
import { generateFractionLesson } from "@/content/generators/fractionIdentification";

interface BakeryPracticeProps {
  onComplete: () => void;
}

/**
 * Proof that the lesson runner can consume procedurally generated content
 * with no template or runner changes — same SlicePicker, same JSON shape,
 * just produced by generateFractionLesson() instead of a static file.
 *
 * Seed is pinned so the live app stays deterministic between deploys.
 */
const PRACTICE_SEED = 42;

const BakeryPractice = ({ onComplete }: BakeryPracticeProps) => {
  const lesson = useMemo(
    () => generateFractionLesson({ seed: PRACTICE_SEED }),
    [],
  );

  return (
    <SlicePicker
      exploreSizes={lesson.exploreSizes}
      challenges={lesson.challenges}
      skillLabel={lesson.skillLabel}
      onComplete={onComplete}
      heading="Practice Round — fresh fractions from the oven!"
    />
  );
};

export default BakeryPractice;
