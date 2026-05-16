/**
 * Offline Training math — Phase 2 (initial pass).
 *
 * Sources cross-checked:
 *   - https://tibia.fandom.com/wiki/Training_School
 *   - https://tibia.fandom.com/wiki/Training
 *   - TibiaPal /offlinetraining (used for output cross-verification)
 *
 * Confirmed facts:
 *   - Each character has a 12-hour offline training pool.
 *   - Pool regenerates 1:1 while online OR while offline AFTER the pool
 *     hits 0:00. Stamina drains it 1:1 while training.
 *   - Need to be logged off for at least 10 minutes for offline training
 *     to "start" (combined with the offline-stamina 10-minute rule).
 *   - Shielding ALWAYS trains in parallel with whichever main skill the
 *     character picked, at HALF the rate of the main skill.
 *   - One minute of offline distance training gives 12 skill tries
 *     (TibiaWiki — anchor figure).
 *   - Loyalty bonus (0–50%) multiplies skill gain.
 *
 * Assumptions (will validate in Phase 3 against TibiaPal):
 *   - Melee (Sword / Axe / Club / Fist) also gives 12 tries/min offline,
 *     same as Distance.
 *   - Magic Level offline gives 30 mana points burned per minute. This is
 *     a working hypothesis: real mana-sit rates with 4 mp/2 sec premium
 *     regen and double-regen-reward equal 120 mana/min ONLINE, so offline
 *     is meaningfully slower. The actual constant is opaque without
 *     direct CipSoft data; we'll tune this once we cross-reference.
 *
 * The math reuses `SKILL_VOCATION_CONSTANTS` and the
 * `totalPointsAtSkill` formula already validated by Exercise Weapons.
 */

import {
  SKILL_VOCATION_CONSTANTS,
  SKILL_CONSTANT,
} from "../data/training";

// --- Base tries/min rates (per skill type, before loyalty) ----------------
// Values reverse-engineered from TibiaPal cross-verification (2026-05-16):
//   Paladin Distance 30→40 = 4 h    → 444,960 pts / 240 min = 1854 pts/min
//   Knight Melee 30→40    = 6 h     → 444,960 pts / 360 min = 1236 pts/min
//   Sorc Magic 20→30      = 89 h    → 171,568 pts / 5,340 min ≈ 32 pts/min
//   Sorc Magic 30→40      = 232 h   → 444,960 pts / 13,920 min ≈ 32 pts/min
// Loyalty acts as the standard (1 + loyalty/100) multiplier.
// Distance trains visibly faster than melee offline — TibiaPal confirms
// this asymmetry that isn't obvious from the wiki text alone.

const OFFLINE_TRIES_PER_MIN = {
  melee: 1236,    // Sword / Axe / Club  (verified against TibiaPal)
  distance: 1854, // Distance Fighting   (verified against TibiaPal)
  magic: 32,      // Mana burned per min (verified against TibiaPal)
  fist: 1236,     // Assume same as melee — same vocation constant (1.1)
                  //   and same statue mechanic. To verify later if a
                  //   Monk test case shows a different rate.
} as const;

export type OfflineSkill =
  | "Magic level"
  | "Sword"
  | "Axe"
  | "Club"
  | "Distance"
  | "Fist";

/** Which base-rate bucket each skill falls into. */
function rateBucketFor(skill: OfflineSkill): number {
  if (skill === "Magic level") return OFFLINE_TRIES_PER_MIN.magic;
  if (skill === "Distance")    return OFFLINE_TRIES_PER_MIN.distance;
  if (skill === "Fist")        return OFFLINE_TRIES_PER_MIN.fist;
  return OFFLINE_TRIES_PER_MIN.melee;
}

/** Cumulative tries (or mana) required to be AT a given skill level. */
function totalPointsAtSkill(vocationConstant: number, skill: number): number {
  if (skill <= 0) return 0;
  if (vocationConstant === 1) return SKILL_CONSTANT * skill;
  return (
    (SKILL_CONSTANT * (Math.pow(vocationConstant, skill) - 1)) /
    (vocationConstant - 1)
  );
}

/** Inverse: given total points, return the (level, % to next) pair. */
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
  const totalAtNext = totalPointsAtSkill(vocationConstant, level + 1);
  const span = totalAtNext - totalAtLevel;
  const pct = span > 0
    ? Math.min(99.99, Math.max(0, ((totalPoints - totalAtLevel) / span) * 100))
    : 0;
  return { level, pct };
}

export interface OfflineInput {
  vocation: string;       // "knight" | "paladin" | "sorcerer" | "druid" | "monk"
  skill: OfflineSkill;
  currentSkill: number;
  /** 0..100, in-game "% completed of current level". */
  pctToNext: number;
  targetSkill: number;
  /** 0..50, premium-account loyalty bonus. */
  loyalty: number;
}

export interface OfflineResult {
  /** Total minutes of offline training time needed to reach target. */
  trainingMinutes: number;
  /** Hours/days breakdown formatted for display. */
  trainingDisplay: string;
  /** With the 12h/day pool cap, real-world days the character has to */
  /** offline-train (1 day = 12h training + 12h logged-on regen). */
  realDaysIfPlayingDaily: number;
  /** Effective main-skill tries delivered per minute (base × loyalty). */
  /** Exposed so the optional shielding-advance UI can derive the */
  /** half-rate shielding gain without re-deriving the rate table. */
  effectiveTriesPerMin: number;
  /** Echoes the inputs for any UI that wants to label the result. */
  inputs: OfflineInput;
}

/** Format minutes as "Xd Yh Zm" — same style as the stamina calc. */
function formatTime(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";
  const totalSec = Math.round(totalMinutes * 60);
  const days = Math.floor(totalSec / 86_400);
  const hours = Math.floor((totalSec % 86_400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${mins}m`);
  return parts.join(" ");
}

/**
 * Validate inputs — same conservative caps as the Exercise Weapons calc
 * to avoid Infinity blowups. Returns the first user-facing error message,
 * or null when everything's fine.
 */
export function validateOfflineInput(input: OfflineInput): string | null {
  const SKILL_CAP = 200;
  if (!input.vocation) return "Pick a vocation in your Character Sheet";
  if (!input.skill) return "Pick a skill to train";
  if (!Number.isFinite(input.currentSkill) || input.currentSkill < 0) {
    return "Enter a valid current skill";
  }
  if (input.currentSkill > SKILL_CAP) return `Current skill max ${SKILL_CAP}`;
  if (!Number.isFinite(input.targetSkill) || input.targetSkill <= 0) {
    return "Enter a target skill";
  }
  if (input.targetSkill > SKILL_CAP) return `Target skill max ${SKILL_CAP}`;
  if (input.targetSkill <= input.currentSkill) {
    return "Target must be higher than current";
  }
  if (!Number.isFinite(input.pctToNext) || input.pctToNext < 0 || input.pctToNext > 100) {
    return "% to next must be 0 – 100";
  }
  const constants = SKILL_VOCATION_CONSTANTS[input.vocation];
  if (!constants || constants[input.skill] == null) {
    return `${input.skill} is not trainable for this vocation`;
  }
  return null;
}

/**
 * Main entry — given a fully-validated input, compute the offline-training
 * output (time needed, parallel shielding gain).
 */
export function computeOfflineTraining(
  input: OfflineInput,
): OfflineResult | null {
  const err = validateOfflineInput(input);
  if (err) return null;

  const constants = SKILL_VOCATION_CONSTANTS[input.vocation];
  const mainConstant = constants[input.skill];

  // Tries needed to advance the MAIN skill from (current, pct) to target.
  const totalAtCurrent = totalPointsAtSkill(mainConstant, input.currentSkill);
  const totalAtNext = totalPointsAtSkill(mainConstant, input.currentSkill + 1);
  const pctCompleted = Math.max(0, Math.min(100, input.pctToNext));
  const trained = (totalAtNext - totalAtCurrent) * (pctCompleted / 100);
  const startPoints = totalAtCurrent + trained;
  const targetPoints = totalPointsAtSkill(mainConstant, input.targetSkill);
  const triesNeeded = Math.max(0, targetPoints - startPoints);

  // Effective tries/min after loyalty bonus.
  const baseTriesPerMin = rateBucketFor(input.skill);
  const loyaltyFactor = 1 + Math.max(0, Math.min(50, input.loyalty)) / 100;
  const effectiveTriesPerMin = baseTriesPerMin * loyaltyFactor;
  if (effectiveTriesPerMin <= 0) return null;

  // Time to accumulate the tries we need.
  const trainingMinutes = triesNeeded / effectiveTriesPerMin;
  const trainingDisplay = formatTime(trainingMinutes);

  // Real-world cadence: the pool caps at 12h/day, so even if you log on
  // and re-log perfectly, you can only train 12 hours per real day.
  const realDaysIfPlayingDaily = trainingMinutes / (12 * 60);

  return {
    trainingMinutes,
    trainingDisplay,
    realDaysIfPlayingDaily,
    effectiveTriesPerMin,
    inputs: input,
  };
}

// ---- Optional shielding advance (opt-in sub-form) -----------------------
// The parallel shielding gain trains at HALF the rate of whatever main
// skill the character picked, for the same total training duration. We
// originally auto-displayed this as "+N levels from 0" but real players
// always start with way more than 0 shielding, so the result was
// misleading. Now it's an opt-in expansion that asks for the user's
// current shielding and converts it into a "you'd end at level X at Y%"
// answer.

export interface ShieldingAdvanceInput {
  vocation: string;
  /** Skill the main calc is training — sets the half-rate basis. */
  mainSkill: OfflineSkill;
  /** Current Shielding level (in-game). */
  currentShielding: number;
  /** 0..100, in-game "% completed" of the current shielding level. */
  pctToNext: number;
  /** Reuse the loyalty from the parent form — same multiplier. */
  loyalty: number;
  /** Total offline training minutes already computed by the main calc. */
  trainingMinutes: number;
}

export interface ShieldingAdvanceResult {
  /** Final shielding level after the same training period. */
  finalLevel: number;
  /** 0..100 — % completed of finalLevel after the period. */
  finalPct: number;
  /** finalLevel − currentShielding (for the "you gained N levels" copy). */
  levelsGained: number;
}

export function validateShieldingAdvance(
  input: ShieldingAdvanceInput,
): string | null {
  const SKILL_CAP = 200;
  if (!input.vocation) return "Pick a vocation in your Character Sheet";
  if (
    !Number.isFinite(input.currentShielding) ||
    input.currentShielding < 0
  ) {
    return "Enter your current shielding";
  }
  if (input.currentShielding > SKILL_CAP) {
    return `Current shielding max ${SKILL_CAP}`;
  }
  if (
    !Number.isFinite(input.pctToNext) ||
    input.pctToNext < 0 ||
    input.pctToNext > 100
  ) {
    return "% to next must be 0 – 100";
  }
  const constants = SKILL_VOCATION_CONSTANTS[input.vocation];
  if (!constants || constants["Shielding"] == null) {
    return "Shielding is not trainable for this vocation";
  }
  return null;
}

export function computeShieldingAdvance(
  input: ShieldingAdvanceInput,
): ShieldingAdvanceResult | null {
  if (validateShieldingAdvance(input)) return null;
  if (!Number.isFinite(input.trainingMinutes) || input.trainingMinutes <= 0) {
    return null;
  }

  const constants = SKILL_VOCATION_CONSTANTS[input.vocation];
  const shieldingConstant = constants["Shielding"];

  const baseTriesPerMin = rateBucketFor(input.mainSkill);
  const loyaltyFactor = 1 + Math.max(0, Math.min(50, input.loyalty)) / 100;
  const shieldingTriesPerMin = (baseTriesPerMin * loyaltyFactor) / 2;
  const triesGained = shieldingTriesPerMin * input.trainingMinutes;

  const totalAtCurrent = totalPointsAtSkill(
    shieldingConstant,
    input.currentShielding,
  );
  const totalAtNext = totalPointsAtSkill(
    shieldingConstant,
    input.currentShielding + 1,
  );
  const pctCompleted = Math.max(0, Math.min(100, input.pctToNext));
  const startPoints =
    totalAtCurrent + (totalAtNext - totalAtCurrent) * (pctCompleted / 100);

  const finalPoints = startPoints + triesGained;
  const { level, pct } = findSkillAndPctFromPoints(
    shieldingConstant,
    finalPoints,
  );
  return {
    finalLevel: level,
    finalPct: pct,
    levelsGained: Math.max(0, level - input.currentShielding),
  };
}
