/**
 * Total experience required to reach level n.
 * Tibia formula: round((50/3) * (n³ - 6n² + 17n - 12)) for n >= 2.
 */
export function expFor(n: number): number {
  if (!Number.isFinite(n) || n < 2) return 0;
  const lvl = Math.floor(n);
  return Math.round((50 / 3) * (lvl * lvl * lvl - 6 * lvl * lvl + 17 * lvl - 12));
}

/** Inverse of expFor — largest level whose required exp is <= the given value. */
export function levelFor(exp: number): number {
  if (!Number.isFinite(exp) || exp < 100) return 1;
  let n = 1;
  while (expFor(n + 1) <= exp) {
    n++;
    if (n > 5000) break; // safety cap; far above any real Tibia level
  }
  return n;
}

export interface DeathLossInput {
  level: number;
  blessingsActive: number; // 0..7
  isPvP: boolean;
  hadTwistOfFate: boolean;
}

export interface DeathLossResult {
  expLost: number;
  blessingsAfter: boolean[]; // 7 entries
}

/**
 * Approximate Tibia death-loss math (PvE). PvP scaling is not modeled here —
 * any skull is treated as full-loss with no Twist-of-Fate save, per CLAUDE.md.
 *
 * blessReduction = (active / 7) * 0.8 — max ~80% reduction with all 7.
 * lossPct        = 0.10 * (1 - blessReduction)
 */
export function computeDeathLoss(input: DeathLossInput): DeathLossResult {
  const { level, blessingsActive, isPvP, hadTwistOfFate } = input;
  const blessReduction = (Math.max(0, Math.min(7, blessingsActive)) / 7) * 0.8;
  const lossPct = 0.10 * (1 - blessReduction);
  const expLost = Math.max(0, Math.round(expFor(level) * lossPct));

  const blessingsAfter = [false, false, false, false, false, false, false];
  // PvE death with Twist of Fate active keeps 1 blessing slot (Twist itself).
  // PvP death wipes everything including Twist of Fate.
  if (!isPvP && hadTwistOfFate) blessingsAfter[6] = true;

  return { expLost, blessingsAfter };
}
