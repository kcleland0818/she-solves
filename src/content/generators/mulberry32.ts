/**
 * Mulberry32 — tiny deterministic PRNG.
 * Same seed → same sequence, forever. Used to make generated lessons
 * reproducible (bug reports, per-player worlds, stable tests).
 *
 * Not cryptographically secure. Do not use for anything security-related.
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function rng() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inclusive integer in [min, max]. */
export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Pick one item from a non-empty array. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
