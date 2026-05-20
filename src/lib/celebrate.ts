// Helpers to keep correct-answer feedback warm, varied, and on-brand
// across all three shops. Used inside scene `setFeedback(...)` for the
// CORRECT path only — wrong-answer copy stays gentle and stays put.

type Shop = "smoothie" | "bakery" | "bookstore";

const OPENERS: Record<Shop, string[]> = {
  smoothie: ["YES!", "Boom —", "Nailed it!", "There it is!", "Locked in!"],
  bakery: ["Yes, chef!", "Sweet!", "Nailed it!", "Boom —", "Fresh out the oven!"],
  bookstore: ["Yes!", "Page-turner!", "There it is!", "Locked in!", "Right on the shelf!"],
};

let lastIdx: Record<Shop, number> = { smoothie: -1, bakery: -1, bookstore: -1 };

export const celebratoryOpener = (shop: Shop): string => {
  const opts = OPENERS[shop];
  let i = Math.floor(Math.random() * opts.length);
  if (i === lastIdx[shop]) i = (i + 1) % opts.length;
  lastIdx[shop] = i;
  return opts[i];
};

export const skillBeat = (skill: string): string => `That's ${skill} — unlocked.`;
