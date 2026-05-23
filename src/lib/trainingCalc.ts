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
  pctToGo: number;
  targetSkill: number;
}

/**
 * Points needed to advance from current skill to target.
 *
 * Convention for `pctToGo` matches the in-game skill display verbatim:
 * Tibia tells you "You have ##.##% to go" toward the next skill level, so
 *     0   = effectively at the next level (about to ding)
 *   100   = just dinged this skill — full level still ahead
 *
 * I.e. pctToGo is the % of the current span that is STILL REMAINING. This
 * is the opposite of "% trained" — copying the in-game number directly
 * into our forms is the user expectation. We previously inverted this and
 * silently over-recommended weapons by ~50% on most inputs (fixed
 * 2026-05-23 after side-by-side comparison with TibiaPal showed the bug).
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
  const pctRemaining = Math.max(0, Math.min(100, input.pctToGo));
  const trained = (totalAtNext - totalAtCurrent) * (1 - pctRemaining / 100);
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
  pctToGo: number,
): number {
  const totalAtCurrent = totalPointsAtSkill(vocationConstant, currentSkill);
  const totalAtNext = totalPointsAtSkill(vocationConstant, currentSkill + 1);
  const pctRemaining = Math.max(0, Math.min(100, pctToGo));
  const trained = (totalAtNext - totalAtCurrent) * (1 - pctRemaining / 100);
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
  pctToGo: number,
  weaponType: WeaponType,
  mods: Modifiers,
  tcMarketPriceGp: number,
): WeaponResult {
  // Same defensive cap as computeSmartMix — refuse to compute if inputs
  // would overflow into Infinity / NaN, which can pin the page (millions
  // of weapons "needed" would also blow up the formatter downstream).
  if (!Number.isFinite(pointsRequired) || pointsRequired <= 0) {
    // endPct in the result is "% trained" (the inverse of pctToGo input)
    // so the caller's display formatter can render "X% remaining → N+1".
    return {
      weapons: 0,
      totalPointsGained: 0,
      endLevel: currentSkill,
      endPct: Math.max(0, Math.min(100, 100 - pctToGo)),
      costTC: 0,
      costGP: 0,
      hours: 0,
      overshoot: 0,
    };
  }
  const stats = EXERCISE_WEAPONS[weaponType];
  const effPoints = effectiveWeaponPoints(stats.points, mods);
  const weapons =
    pointsRequired > 0 && effPoints > 0
      ? Math.ceil(pointsRequired / effPoints)
      : 0;
  const totalPointsGained = weapons * effPoints;

  const startPoints = startPointsFor(vocationConstant, currentSkill, pctToGo);
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
  pctToGo: number,
  mods: Modifiers,
  tcMarketPriceGp: number,
): SmartMixResult {
  // Defensive cap: if pointsRequired is Infinity (overflow when totalAtSkill
  // gets called with an absurd target) or NaN, the L/D enumeration below
  // would iterate forever and freeze the main thread. Bail out cleanly.
  // Also cap at a sane upper bound — even a max-level Tibia character
  // training to ML 200 needs <10^12 points.
  const MAX_REASONABLE_POINTS = 1e14;
  if (
    !Number.isFinite(pointsRequired) ||
    pointsRequired > MAX_REASONABLE_POINTS ||
    pointsRequired <= 0
  ) {
    // endPct in the result is "% trained" — caller's formatter inverts it.
    return {
      regular: 0,
      durable: 0,
      lasting: 0,
      totalPointsGained: 0,
      endLevel: currentSkill,
      endPct: Math.max(0, Math.min(100, 100 - pctToGo)),
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

  // Hard iteration cap — the inner loops should never need this many steps
  // for any realistic input, but it's a safety net against a future code
  // change accidentally letting an out-of-range value through validation.
  const MAX_ITERS = 100_000;
  let iters = 0;

  const maxL = Math.min(
    MAX_ITERS,
    Math.floor(pointsRequired / lstPts) + 1,
  );

  for (let L = 0; L <= maxL; L++) {
    if (++iters > MAX_ITERS) break;
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

    const maxD = Math.min(
      MAX_ITERS,
      Math.floor(afterL / durPts) + 1,
    );
    for (let D = 0; D <= maxD; D++) {
      if (++iters > MAX_ITERS) break;
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
  const startPoints = startPointsFor(vocationConstant, currentSkill, pctToGo);
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

/**
 * Death skill loss — applies the same effective percentage that was lost on
 * exp to the player's accumulated skill tries, then converts back to a
 * (skill, % remaining) pair.
 *
 * `effectivePctLoss` should be (expBefore - expAfter) / expBefore so that
 * promotion + blessings reductions are already baked in (TibiaWiki: skill
 * loss uses the same percentage as exp loss).
 */
export function computeSkillLossAfterDeath(
  vocationConstant: number,
  currentSkill: number,
  pctToGo: number,
  effectivePctLoss: number,
): { level: number; pct: number } {
  const safePct = Math.max(0, Math.min(1, effectivePctLoss));
  const startPoints = startPointsFor(vocationConstant, currentSkill, pctToGo);
  const triesLost = startPoints * safePct;
  const remaining = Math.max(0, startPoints - triesLost);
  return findSkillAndPctFromPoints(vocationConstant, remaining);
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
