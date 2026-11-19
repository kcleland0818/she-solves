import { mulberry32, randInt } from "./mulberry32";
import type { SentenceProblem } from "@/components/templates/SentenceToInequality";

const rules = [
  { answer: "lt", phrase: "fewer than", hint: "Fewer than excludes the boundary, so use <." },
  { answer: "lte", phrase: "at most", hint: "At most includes the boundary, so use ≤." },
  { answer: "gt", phrase: "more than", hint: "More than excludes the boundary, so use >." },
  { answer: "gte", phrase: "at least", hint: "At least includes the boundary, so use ≥." },
] as const;

export function generateInequalityLesson({ seed }: { seed: number }) {
  const rng = mulberry32(seed);
  const problems: SentenceProblem[] = rules.map((rule) => {
    const number = randInt(rng, 5, 40);
    return {
      sentence: `The reading club needs ${rule.phrase} ${number} books.`,
      variable: "b", number, answer: rule.answer, hint: rule.hint,
      range: [0, number + 10], samples: [number - 1, number, number + 1],
    };
  });
  for (let i = problems.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [problems[i], problems[j]] = [problems[j], problems[i]];
  }
  return { problems, skillLabel: "Writing Inequalities" };
}