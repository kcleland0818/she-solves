import { describe, expect, it } from "vitest";
import { generateRatioLesson } from "./ratioScaling";
import { generateInequalityLesson } from "./inequalityWriting";
import smoothie from "../lessons/smoothie.json";
import bookstore from "../lessons/bookstore.json";
import { validateLesson } from "../lessons/validate";

describe("fresh shop practice", () => {
  it("enables valid practice in both shop lessons", () => {
    expect(smoothie.practice).toBe("SmoothiePractice");
    expect(bookstore.practice).toBe("BookstorePractice");
    expect(validateLesson(smoothie).valid).toBe(true);
    expect(validateLesson(bookstore).valid).toBe(true);
  });
  it("is repeatable for the same seed", () => {
    expect(generateRatioLesson({ seed: 42 })).toEqual(generateRatioLesson({ seed: 42 }));
    expect(generateInequalityLesson({ seed: 42 })).toEqual(generateInequalityLesson({ seed: 42 }));
  });
  it("produces fresh banks across seeds", () => {
    const seeds = Array.from({ length: 20 }, (_, i) => i);
    expect(new Set(seeds.map((seed) => JSON.stringify(generateRatioLesson({ seed })))).size).toBeGreaterThan(15);
    expect(new Set(seeds.map((seed) => JSON.stringify(generateInequalityLesson({ seed })))).size).toBe(20);
  });
  it.each(Array.from({ length: 20 }, (_, i) => i))("seed %i is solvable within the sliders", (seed) => {
    for (const c of generateRatioLesson({ seed }).challenges) {
      const scale = c.minTotal / (c.ratio + 1);
      expect(Number.isInteger(scale)).toBe(true);
      expect(scale).toBeGreaterThan(1);
      expect(c.ratio * scale).toBeLessThanOrEqual(10);
      expect(scale).toBeLessThanOrEqual(10);
    }
  });
  it.each(Array.from({ length: 20 }, (_, i) => i))("seed %i has correct inequality boundaries", (seed) => {
    const problems = generateInequalityLesson({ seed }).problems;
    expect(new Set(problems.map((p) => p.answer))).toEqual(new Set(["lt", "lte", "gt", "gte"]));
    const phrases = { lt: "fewer than", lte: "at most", gt: "more than", gte: "at least", eq: "equals" };
    for (const p of problems) {
      expect(p.sentence).toContain(`${phrases[p.answer]} ${p.number} books`);
      expect(p.range[0]).toBeLessThan(p.number);
      expect(p.range[1]).toBeGreaterThan(p.number);
      expect(p.samples).toEqual([p.number - 1, p.number, p.number + 1]);
    }
  });
});