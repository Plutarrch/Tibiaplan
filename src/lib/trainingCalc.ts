import {
  EXERCISE_WEAPONS,
  SKILL_CONSTANT,
  type WeaponType,
} from "../data/training";

export interface Modifiers {
  doubleEvent: boolean;
  privateDummy: boolean;
  loyalty: number; // 0..50
}

/** Cumulative skill points required to be AT a given level. */
function totalPointsAtSkill(
  vocationConstant: number,
  skill: number,
): number {
  if (skill <= 0) return 0;
  if (vocationConstant === 1) return SKILL_CONSTANT * skill;
  return (
    (SKILL_CONSTANT * (Math.pow(vocationConstant, skill) - 1)) /
    (vocationConstant - 1)
  );
}

export interface PointsNeededInput {
  vocationConstant: number;
  currentSkill: number;
  pctToNext: number;
  targetSkill: number;
}

/**
 * Points needed to advance from current skill to target.
 *
 * Convention for `pctToNext` (matches TibiaPal exactly so users can compare):
 *   100 = just dinged the current level (no progress yet toward next)
 *     0 = at the boundary of the next level (full level remaining is "drained")
 *
 * I.e. pctToNext is the % of the current level that is still "to go".
 */
export function pointsNeeded(input: PointsNeededInput): number {
  const totalAtCurrent = totalPointsAtSkill(
    input.vocationConstant,
    input.currentSkill,
  );
  const totalAtNext = totalPointsAtSkill(
    input.vocationConstant,
    input.currentSkill + 1,
  );
  const pctRemaining = Math.max(0, Math.min(100, input.pctToNext));
  // Already-trained portion of the current level = (100 - remaining%) of the level cost.
  const trained = (totalAtNext - totalAtCurrent) * ((100 - pctRemaining) / 100);
  const startPoints = totalAtCurrent + trained;
  const targetPoints = totalPointsAtSkill(
    input.vocationConstant,
    input.targetSkill,
  );
  return Math.max(0, targetPoints - startPoints);
}

/** Compute the user's starting point in absolute skill points (for end-skill display). */
function startPointsFor(
  vocationConstant: number,
  currentSkill: number,
  pctToNext: number,
): number {
  const totalAtCurrent = totalPointsAtSkill(vocationConstant, currentSkill);
  const totalAtNext = totalPointsAtSkill(vocationConstant, currentSkill + 1);
  const pctRemaining = Math.max(0, Math.min(100, pctToNext));
  const trained = (totalAtNext - totalAtCurrent) * ((100 - pctRemaining) / 100);
  return totalAtCurrent + trained;
}

/** Effective points each weapon yields after applying modifiers. */
function effectiveWeaponPoints(
  weaponPoints: number,
  mods: Modifiers,
): number {
  let p = weaponPoints;
  if (mods.doubleEvent) p *= 2;
  if (mods.privateDummy) p *= 1.1;
  p *= 1 + Math.max(0, Math.min(50, mods.loyalty)) / 100;
  return p;
}

/** Reverse the formula: given total points reached, find the skill X.YY%. */
function findSkillAndPctFromPoints(
  vocationConstant: number,
  totalPoints: number,
): { level: number; pct: number } {
  if (totalPoints <= 0) return { level: 0, pct: 0 };

  let level = 0;
  while (
    totalPointsAtSkill(vocationConstant, level + 1) <= totalPoints &&
    level < 1000
  ) {
    level++;
  }

  const totalAtLevel = totalPointsAtSkill(vocationConstant, level);
  const totalAtNextLevel = totalPointsAtSkill(vocationConstant, level + 1);
  const span = totalAtNextLevel - totalAtLevel;
  const pct =
    span > 0
      ? Math.min(99.99, Math.max(0, ((totalPoints - totalAtLevel) / span) * 100))
      : 0;

  return { level, pct };
}

export interface WeaponResult {
  weapons: number;
  totalPointsGained: number;
  endLevel: number;
  endPct: number;
  costTC: number;
  costGP: number;
  hours: number;
  overshoot: number;
}

/** Single-weapon-type result: how many of a given weapon you'd need (rounded up). */
export function computeSingleWeaponResult(
  pointsRequired: number,
  vocationConstant: number,
  currentSkill: number,
  pctToNext: number,
  weaponType: WeaponType,
  mods: Modifiers,
  tcMarketPriceGp: number,
): WeaponResult {
  const stats = EXERCISE_WEAPONS[weaponType];
  const effPoints = effectiveWeaponPoints(stats.points, mods);
  const weapons =
    pointsRequired > 0 && effPoints > 0
      ? Math.ceil(pointsRequired / effPoints)
      : 0;
  const totalPointsGained = weapons * effPoints;

  const startPoints = startPointsFor(vocationConstant, currentSkill, pctToNext);
  const endPoints = startPoints + totalPointsGained;

  const { level: endLevel, pct: endPct } = findSkillAndPctFromPoints(
    vocationConstant,
    endPoints,
  );

  return {
    weapons,
    totalPointsGained,
    endLevel,
    endPct,
    costTC: weapons * stats.costTC,
    costGP: weapons * stats.costTC * tcMarketPriceGp,
    hours: weapons * stats.hoursPerWeapon,
    overshoot: Math.max(0, totalPointsGained - pointsRequired),
  };
}

export interface SmartMixResult {
  regular: number;
  durable: number;
  lasting: number;
  totalPointsGained: number;
  endLevel: number;
  endPct: number;
  costTC: number;
  costGP: number;
  hours: number;
  overshoot: number;
}

/**
 * Truly-optimal mix: enumerates feasible (Lasting, Durable, Regular) combos
 * and picks the one with the lowest total points (= lowest overshoot, also
 * lowest cost since all three weapon types are priced identically per point).
 * Tie-breaks on fewest total weapons so the player has less to click through.
 *
 * Bound: max ~ (pointsRequired / lasting + 2) × (durable_per_lasting + 2) iters,
 * which is small for any realistic training target.
 */
export function computeSmartMix(
  pointsRequired: number,
  vocationConstant: number,
  currentSkill: number,
  pctToNext: number,
  mods: Modifiers,
  tcMarketPriceGp: number,
): SmartMixResult {
  if (pointsRequired <= 0) {
    return {
      regular: 0,
      durable: 0,
      lasting: 0,
      totalPointsGained: 0,
      endLevel: currentSkill,
      endPct: pctToNext,
      costTC: 0,
      costGP: 0,
      hours: 0,
      overshoot: 0,
    };
  }

  const regPts = effectiveWeaponPoints(EXERCISE_WEAPONS.regular.points, mods);
  const durPts = effectiveWeaponPoints(EXERCISE_WEAPONS.durable.points, mods);
  const lstPts = effectiveWeaponPoints(EXERCISE_WEAPONS.lasting.points, mods);

  let bestL = 0;
  let bestD = 0;
  let bestR = Math.ceil(pointsRequired / regPts);
  let bestTotal = bestR * regPts;
  let bestWeapons = bestR;

  const maxL = Math.floor(pointsRequired / lstPts) + 1;

  for (let L = 0; L <= maxL; L++) {
    const afterL = pointsRequired - L * lstPts;

    if (afterL <= 0) {
      // L lastings alone already covers requirement
      const total = L * lstPts;
      const weapons = L;
      if (total < bestTotal || (total === bestTotal && weapons < bestWeapons)) {
        bestL = L; bestD = 0; bestR = 0;
        bestTotal = total; bestWeapons = weapons;
      }
      continue;
    }

    const maxD = Math.floor(afterL / durPts) + 1;
    for (let D = 0; D <= maxD; D++) {
      const afterLD = afterL - D * durPts;
      const R = afterLD > 0 ? Math.ceil(afterLD / regPts) : 0;
      const total = L * lstPts + D * durPts + R * regPts;
      if (total < pointsRequired) continue; // doesn't satisfy the target
      const weapons = L + D + R;
      if (total < bestTotal || (total === bestTotal && weapons < bestWeapons)) {
        bestL = L; bestD = D; bestR = R;
        bestTotal = total; bestWeapons = weapons;
      }
    }
  }

  const totalPointsGained = bestTotal;
  const startPoints = startPointsFor(vocationConstant, currentSkill, pctToNext);
  const endPoints = startPoints + totalPointsGained;

  const { level: endLevel, pct: endPct } = findSkillAndPctFromPoints(
    vocationConstant,
    endPoints,
  );

  const costTC =
    bestL * EXERCISE_WEAPONS.lasting.costTC +
    bestD * EXERCISE_WEAPONS.durable.costTC +
    bestR * EXERCISE_WEAPONS.regular.costTC;

  const hours =
    bestL * EXERCISE_WEAPONS.lasting.hoursPerWeapon +
    bestD * EXERCISE_WEAPONS.durable.hoursPerWeapon +
    bestR * EXERCISE_WEAPONS.regular.hoursPerWeapon;

  return {
    regular: bestR,
    durable: bestD,
    lasting: bestL,
    totalPointsGained,
    overshoot: Math.max(0, totalPointsGained - pointsRequired),
    endLevel,
    endPct,
    costTC,
    costGP: costTC * tcMarketPriceGp,
    hours,
  };
}

// ---- Display formatters ----

/** Format gold pieces using k/kk/kkk Tibia notation, with a space before the unit. */
export function formatGold(gp: number): string {
  if (!Number.isFinite(gp) || gp <= 0) return "0";
  if (gp < 1000) return Math.round(gp).toLocaleString();
  if (gp < 1_000_000) return `${(gp / 1000).toFixed(1)} k`;
  if (gp < 1_000_000_000) return `${(gp / 1_000_000).toFixed(2)} kk`;
  if (gp < 1_000_000_000_000) return `${(gp / 1_000_000_000).toFixed(2)} kkk`;
  return `${(gp / 1_000_000_000_000).toFixed(2)} kkkk`;
}

/** Format hours as "Xh" or "Xh Ym" — never converts to days. */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes - h * 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Localize an integer count, e.g. 1234567 → "1,234,567". */
export function formatCount(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString();
}
