import { mulberry32, randInt } from "./mulberry32";
import type { RatioChallenge } from "@/components/templates/RatioMixer";

/** Targets always have an exact solution within the mixer's 0–10 sliders. */
export function generateRatioLesson({ seed }: { seed: number }) {
  const rng = mulberry32(seed);
  const challenges: RatioChallenge[] = [];
  for (let ratio = 1; ratio <= 4; ratio++) {
    const scale = randInt(rng, 2, Math.floor(10 / ratio));
    const minTotal = (ratio + 1) * scale;
    challenges.push({
      ratio, minTotal, label: `${ratio}:1`,
      desc: `Keep the ${ratio}:1 ratio but make at least ${minTotal} parts total!`,
    });
  }
  // Shuffle so every bank can open with a different recipe.
  for (let i = challenges.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [challenges[i], challenges[j]] = [challenges[j], challenges[i]];
  }
  return {
    skillLabel: "Scaling Ratios",
    ingredientA: { name: "Strawberry", emoji: "🍓", colorVar: "--smoothie-strawberry" },
    ingredientB: { name: "Banana", emoji: "🍌", colorVar: "--smoothie-banana" },
    challenges,
  };
}