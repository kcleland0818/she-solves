import { mulberry32, randInt, pick } from "./mulberry32";

export const PRIZE_COLORS = ["gold", "red", "blue", "green"] as const;
export type PrizeColor = (typeof PRIZE_COLORS)[number];

export interface SpinnerProblem {
  /** One entry per equal wheel section. */
  sections: PrizeColor[];
  target: PrizeColor;
}

export interface Bag { label: string; prizes: number; total: number }
export interface BagProblem { prizeName: string; bags: [Bag, Bag]; /** index of the better bag */ answer: 0 | 1 }

export type Likelihood = "impossible" | "unlikely" | "even" | "likely" | "certain";

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
};

export const likelihoodOf = (count: number, total: number): Likelihood => {
  if (count <= 0) return "impossible";
  if (count >= total) return "certain";
  if (count * 2 === total) return "even";
  return count * 2 < total ? "unlikely" : "likely";
};

export const countOf = (p: SpinnerProblem) => p.sections.filter((s) => s === p.target).length;

export function generateSpinner(rng: () => number): SpinnerProblem {
  const total = pick(rng, [4, 6, 8, 10, 12] as const);
  const target = pick(rng, PRIZE_COLORS);
  const count = randInt(rng, 1, total - 1);
  const others = PRIZE_COLORS.filter((c) => c !== target);
  const sections: PrizeColor[] = Array.from({ length: total }, (_, i) =>
    i < count ? target : others[randInt(rng, 0, others.length - 1)],
  );
  // Spread colors around the wheel.
  for (let i = sections.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [sections[i], sections[j]] = [sections[j], sections[i]];
  }
  return { sections, target };
}

export function generateBagProblem(rng: () => number): BagProblem {
  const prizeName = pick(rng, ["golden tickets", "star tokens", "mega gems"] as const);
  for (;;) {
    const a: Bag = { label: "Bag A", total: randInt(rng, 4, 12), prizes: 0 };
    const b: Bag = { label: "Bag B", total: randInt(rng, 4, 12), prizes: 0 };
    a.prizes = randInt(rng, 1, a.total - 1);
    b.prizes = randInt(rng, 1, b.total - 1);
    const pa = a.prizes * b.total, pb = b.prizes * a.total;
    if (pa !== pb) return { prizeName, bags: [a, b], answer: pa > pb ? 0 : 1 };
  }
}

export function generateProbabilityLesson({ seed }: { seed: number }) {
  const rng = mulberry32(seed);
  return {
    spinners: [generateSpinner(rng), generateSpinner(rng), generateSpinner(rng)],
    bags: [generateBagProblem(rng), generateBagProblem(rng)],
  };
}
