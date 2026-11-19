import { describe, it, expect } from "vitest";
import { generateProbabilityLesson, likelihoodOf, simplify, countOf } from "./probability";

describe("probability generator", () => {
  it("produces 20 valid practice sets", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { spinners, bags } = generateProbabilityLesson({ seed });
      for (const s of spinners) {
        const c = countOf(s);
        expect(c).toBeGreaterThan(0);
        expect(c).toBeLessThan(s.sections.length);
      }
      for (const b of bags) {
        const [a, bb] = b.bags;
        const pa = a.prizes / a.total, pb = bb.prizes / bb.total;
        expect(pa).not.toBe(pb);
        expect(b.answer).toBe(pa > pb ? 0 : 1);
      }
    }
  });
  it("is deterministic for a seed", () => {
    expect(generateProbabilityLesson({ seed: 7 })).toEqual(generateProbabilityLesson({ seed: 7 }));
  });
  it("simplifies 2/8 to 1/4", () => expect(simplify(2, 8)).toEqual([1, 4]));
  it("labels likelihood", () => {
    expect(likelihoodOf(0, 6)).toBe("impossible");
    expect(likelihoodOf(1, 6)).toBe("unlikely");
    expect(likelihoodOf(3, 6)).toBe("even");
    expect(likelihoodOf(5, 6)).toBe("likely");
    expect(likelihoodOf(6, 6)).toBe("certain");
  });
});
