import { mulberry32, randInt, pick } from "./mulberry32";
import type { SliceChallenge } from "@/components/templates/SlicePicker";

export interface FractionLessonContent {
  skillLabel: string;
  exploreSizes: number[];
  challenges: SliceChallenge[];
}

export interface FractionLessonOptions {
  /** Seed for the RNG. Same seed → same lesson. */
  seed: number;
  /** How many challenge fractions to emit. Default 8. */
  count?: number;
  /** Allowed denominators. Default [3,4,6,8]. */
  denominators?: number[];
  /** Cake sizes shown during the free-explore phase. Default = denominators. */
  exploreSizes?: number[];
  /**
   * If false (default), skip 0/n and n/n — they're visually degenerate.
   * Keep 1/n and (n-1)/n which are pedagogically useful.
   */
  allowTrivial?: boolean;
  /** Skill stamp text. */
  skillLabel?: string;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * Deterministic fraction-identification lesson generator.
 * Produces the exact JSON shape SlicePicker consumes — no template edits needed.
 *
 * Guarantees:
 *  - numerator/denominator are integers with 0 < numerator < denominator (unless allowTrivial)
 *  - all fractions in a lesson are unique by *reduced* value (no 1/2 and 2/4 together)
 *  - denominators come from the allowed set
 *  - output is deterministic given the seed + options
 */
export function generateFractionLesson(
  opts: FractionLessonOptions,
): FractionLessonContent {
  const {
    seed,
    count = 8,
    denominators = [3, 4, 6, 8],
    exploreSizes,
    allowTrivial = false,
    skillLabel = "Identifying Fractions",
  } = opts;

  if (denominators.length === 0) {
    throw new Error("generateFractionLesson: denominators must be non-empty");
  }

  const rng = mulberry32(seed);
  const challenges: SliceChallenge[] = [];
  const seenReduced = new Set<string>();

  // Cap attempts so a bad option set can never infinite-loop.
  const maxAttempts = count * 50;
  let attempts = 0;

  while (challenges.length < count && attempts < maxAttempts) {
    attempts++;
    const denominator = pick(rng, denominators);
    const minN = allowTrivial ? 0 : 1;
    const maxN = allowTrivial ? denominator : denominator - 1;
    if (maxN < minN) continue;
    const numerator = randInt(rng, minN, maxN);

    const g = gcd(numerator === 0 ? denominator : numerator, denominator);
    const key = `${numerator / g}/${denominator / g}`;
    if (seenReduced.has(key)) continue;
    seenReduced.add(key);

    challenges.push({
      numerator,
      denominator,
      label: `${numerator}/${denominator}`,
    });
  }

  return {
    skillLabel,
    exploreSizes: exploreSizes ?? [...denominators],
    challenges,
  };
}
