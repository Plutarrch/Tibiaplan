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

// ---------------------------------------------------------------------------
// Death penalty — exact math per TibiaWiki.
// Sources (visited 2026-05-07):
//   - https://tibia.fandom.com/wiki/Death
//   - https://tibia.fandom.com/wiki/Blessings
//   - https://tibia.fandom.com/wiki/Twist_of_Fate
//   - https://tibia.fandom.com/wiki/Adventurer%27s_Blessing
//   - https://tibia.fandom.com/wiki/Skull_System
// Out-of-scope (intentional): Unfair Fight, Retro Hardcore PvP rules.
// ---------------------------------------------------------------------------

export type DeathType = "pve" | "pvp-white" | "pvp-red" | "pvp-black";

/**
 * Maximum Experience Loss before promotion / blessings reductions.
 *   Level  1–23: 10% of total accumulated experience.
 *   Level 24+ : ((x+50)/100) * 50 * (x² − 5x + 8)
 */
export function maxExperienceLoss(level: number, totalExp: number): number {
  if (!Number.isFinite(level) || level < 2) return 0;
  const x = Math.floor(level);
  if (x <= 23) {
    return Math.max(0, Math.round(totalExp * 0.10));
  }
  const mel = ((x + 50) / 100) * 50 * (x * x - 5 * x + 8);
  return Math.max(0, Math.round(mel));
}

/**
 * Apply promotion (-30%) and blessings (-8% each, additive) to the MeL.
 * Final factor cannot go below 0 (you never gain exp from dying).
 *
 *   factor = max(0, 1 − blessings*0.08 − (promoted ? 0.30 : 0))
 */
export function reducedExperienceLoss(
  mel: number,
  promoted: boolean,
  regularBlessingsActive: number,
): number {
  const bless = Math.max(0, Math.min(7, Math.floor(regularBlessingsActive)));
  const reduction = bless * 0.08 + (promoted ? 0.30 : 0);
  const factor = Math.max(0, 1 - reduction);
  return Math.round(mel * factor);
}

/**
 * Item Loss table from TibiaWiki — Death.
 * Independent of the death type unless a red/black skull forces 100% drop.
 */
const CONTAINER_DROP_BY_BLESS = [1.00, 0.70, 0.45, 0.25, 0.10, 0.00] as const;
const EQUIPMENT_DROP_BY_BLESS = [0.10, 0.07, 0.045, 0.025, 0.01, 0.00] as const;

export function containerDropChance(regularBlessingsActive: number): number {
  const n = Math.max(0, Math.min(5, Math.floor(regularBlessingsActive)));
  return CONTAINER_DROP_BY_BLESS[n];
}

export function equipmentDropChance(regularBlessingsActive: number): number {
  const n = Math.max(0, Math.min(5, Math.floor(regularBlessingsActive)));
  return EQUIPMENT_DROP_BY_BLESS[n];
}

export interface DeathInput {
  level: number;
  totalExp: number;
  promoted: boolean;
  /** 8 booleans: [0..6] = regular blessings, [7] = Twist of Fate. */
  blessings: boolean[];
  /** True if the character still has the free lvl-1-20 protection. */
  hasAdventurersBlessing: boolean;
  deathType: DeathType;
}

export interface DeathResult {
  expLost: number;
  /** New blessings array after the death (same 8-slot layout). */
  blessingsAfter: boolean[];
  /** Drop probabilities for the equipped backpack (0..1). */
  containerDropChance: number;
  /** Drop probability for each equipped item slot (0..1). */
  equipmentDropChance: number;
  /** True for red/black-skull deaths — every slot drops with certainty. */
  allItemsLost: boolean;
}

/**
 * Compute the precise outcome of a death given the character's full state.
 * Pure function (no I/O) — all reasoning lives here so the simulator just
 * applies the result.
 *
 * Adventurer's Blessing fully protects PvP deaths (no exp/skill/item loss),
 * but does NOT protect PvE deaths.
 */
export function computeDeath(input: DeathInput): DeathResult {
  const blessings = input.blessings.slice();
  while (blessings.length < 8) blessings.push(false);
  const isPvP = input.deathType !== "pve";

  // Adventurer's Blessing: full protection in PvP only.
  if (input.hasAdventurersBlessing && isPvP) {
    return {
      expLost: 0,
      blessingsAfter: blessings,
      containerDropChance: 0,
      equipmentDropChance: 0,
      allItemsLost: false,
    };
  }

  const regularActive = blessings.slice(0, 7).filter(Boolean).length;
  const hasTwistOfFate = !!blessings[7];

  // Experience loss — same MeL formula in PvE and PvP.
  const mel = maxExperienceLoss(input.level, input.totalExp);
  const expLost = reducedExperienceLoss(mel, input.promoted, regularActive);

  // Default item-drop chances (used for PvE and PvP-white).
  let cDrop = containerDropChance(regularActive);
  let eDrop = equipmentDropChance(regularActive);
  let allItemsLost = false;

  // Blessing consumption matrix.
  const after = blessings.slice();

  if (input.deathType === "pve") {
    // PvE death: every regular blessing is consumed; ToF stays.
    for (let i = 0; i < 7; i++) after[i] = false;
  } else if (input.deathType === "pvp-white") {
    // White-skull / no-skull PvP: ToF (if present and meaningful) is the only
    // thing consumed; regulars and AoL are spared. With no ToF, regulars are
    // consumed normally. With ToF but no regulars and no AoL, ToF doesn't
    // even get spent.
    if (hasTwistOfFate && regularActive > 0) {
      after[7] = false;
    } else if (hasTwistOfFate) {
      // ToF stays — nothing for it to protect.
    } else {
      for (let i = 0; i < 7; i++) after[i] = false;
    }
  } else if (input.deathType === "pvp-red") {
    // Red Skull: all worn items drop regardless of AoL/blessings, and every
    // regular blessing is lost. Twist of Fate, per TibiaWiki Skull System,
    // is preserved.
    cDrop = 1;
    eDrop = 1;
    allItemsLost = true;
    for (let i = 0; i < 7; i++) after[i] = false;
    // ToF stays
  } else if (input.deathType === "pvp-black") {
    // Black Skull: all worn items drop, all blessings consumed including ToF.
    cDrop = 1;
    eDrop = 1;
    allItemsLost = true;
    for (let i = 0; i < 8; i++) after[i] = false;
  }

  return {
    expLost,
    blessingsAfter: after,
    containerDropChance: cDrop,
    equipmentDropChance: eDrop,
    allItemsLost,
  };
}
