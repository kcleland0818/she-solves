import { describe, it, expect } from "vitest";
import { generateFractionLesson } from "./fractionIdentification";

describe("generateFractionLesson", () => {
  const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

  it("is deterministic for the same seed", () => {
    const a = generateFractionLesson({ seed: 42 });
    const b = generateFractionLesson({ seed: 42 });
    expect(a).toEqual(b);
  });

  it("produces different lessons for different seeds", () => {
    const a = generateFractionLesson({ seed: 1 });
    const b = generateFractionLesson({ seed: 2 });
    expect(a.challenges).not.toEqual(b.challenges);
  });

  it.each(SEEDS)("seed %i emits a valid 8-challenge lesson", (seed) => {
    const lesson = generateFractionLesson({ seed });
    const allowed = new Set([3, 4, 6, 8]);

    expect(lesson.skillLabel).toBe("Identifying Fractions");
    expect(lesson.challenges).toHaveLength(8);

    const reducedKeys = new Set<string>();
    for (const c of lesson.challenges) {
      // Structural
      expect(Number.isInteger(c.numerator)).toBe(true);
      expect(Number.isInteger(c.denominator)).toBe(true);
      expect(allowed.has(c.denominator)).toBe(true);

      // Non-trivial by default
      expect(c.numerator).toBeGreaterThan(0);
      expect(c.numerator).toBeLessThan(c.denominator);

      // Label matches raw fraction
      expect(c.label).toBe(`${c.numerator}/${c.denominator}`);

      // Unique reduced form across the lesson
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(c.numerator, c.denominator);
      const key = `${c.numerator / g}/${c.denominator / g}`;
      expect(reducedKeys.has(key)).toBe(false);
      reducedKeys.add(key);
    }
  });

  it("respects a custom denominator set", () => {
    const lesson = generateFractionLesson({ seed: 7, denominators: [5, 10] });
    for (const c of lesson.challenges) {
      expect([5, 10]).toContain(c.denominator);
    }
  });

  it("can emit trivial fractions when explicitly allowed", () => {
    // With denominators=[3] and allowTrivial, values are limited enough that
    // we should be able to see 0/3 or 3/3 across many seeds.
    let sawTrivial = false;
    for (let s = 1; s <= 30 && !sawTrivial; s++) {
      const lesson = generateFractionLesson({
        seed: s,
        count: 4,
        denominators: [3],
        allowTrivial: true,
      });
      sawTrivial = lesson.challenges.some(
        (c) => c.numerator === 0 || c.numerator === c.denominator,
      );
    }
    expect(sawTrivial).toBe(true);
  });
});
