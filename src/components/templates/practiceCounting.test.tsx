import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import RatioMixer from "./RatioMixer";
import SentenceToInequality from "./SentenceToInequality";
import { generateRatioLesson } from "@/content/generators/ratioScaling";
import { generateInequalityLesson } from "@/content/generators/inequalityWriting";

beforeEach(() => vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
}));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe("practice answer counting", () => {
  it("does not count an incorrect smoothie answer", () => {
    const onSolved = vi.fn();
    render(<RatioMixer {...generateRatioLesson({ seed: 1 })} startPhase="challenge" onSolved={onSolved} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Check My Answer" }));
    expect(onSolved).not.toHaveBeenCalled();
  });
  it("counts each bookstore answer only once, including retries", () => {
    const onSolved = vi.fn();
    const problems = generateInequalityLesson({ seed: 1 }).problems;
    render(<SentenceToInequality problems={problems} heading="Practice" skillLabel="Writing Inequalities" onSolved={onSolved} onComplete={() => {}} />);
    const names = { lt: "less than", lte: "less than or equal to", gt: "greater than", gte: "greater than or equal to", eq: "equals" };
    fireEvent.click(screen.getByRole("button", { name: `Pick ${names[problems[0].answer === "lt" ? "gte" : "lt"]}` }));
    expect(onSolved).toHaveBeenCalledTimes(0);
    const answer = screen.getByRole("button", { name: `Pick ${names[problems[0].answer]}` });
    fireEvent.click(answer);
    fireEvent.click(answer);
    expect(onSolved).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Next sentence/ }));
    fireEvent.click(screen.getByRole("button", { name: `Pick ${names[problems[1].answer]}` }));
    expect(onSolved).toHaveBeenCalledTimes(2);
  });
});