/**
 * Math for the Leveling Calculator.
 *
 * Given a current level/exp + target level + selected creature + active
 * modifiers, returns:
 *   - Remaining experience to reach the target level
 *   - Effective experience per kill (base × multiplier)
 *   - Total creatures the player needs to kill
 *   - The flat multiplier from the modifier stack (for the UI badge)
 *
 * Modifiers are multiplicative — that's how Tibia actually stacks them
 * for XP Boost / Stamina Bonus / Double XP / Boosted Creature. A maxed
 * stack (1.5 × 2 × 1.5 × 2 = 9×) is theoretical; in practice players
 * rarely have all four active simultaneously.
 */
import { expFor } from "../data/formulas";

export interface LevelingModifiers {
  /** Tibia Store XP Boost — +50% for 1 hour. */
  xpBoost: boolean;
  /** Stamina bonus (green, premium, 39h+). +50% per kill. */
  staminaBonus: boolean;
  /** Official Double XP event running on the server. +100%. */
  doubleXp: boolean;
  /** Boosted Creature of the Day — +100% only if you're killing that exact creature. */
  boostedCreature: boolean;
}

export interface LevelingInput {
  currentLevel: number;
  /** Total accumulated experience right now (auto-fills from Character Sheet). */
  currentExp: number;
  targetLevel: number;
  /** Base experience reward of the selected creature, pre-modifiers. */
  creatureBaseExp: number;
  modifiers: LevelingModifiers;
}

export interface LevelingResult {
  /** Pure XP delta — target total exp minus current. */
  expRemaining: number;
  /** Total multiplier from the modifier stack (1.0 if none active). */
  multiplier: number;
  /** Per-kill exp gain after multiplier. */
  effectiveExpPerKill: number;
  /** Total creatures the player must kill (rounded UP). */
  creaturesNeeded: number;
}

/** Modifier values — exposed as a constant so the UI can show "+50%" labels
 *  without hardcoding the same numbers twice. */
export const MODIFIER_BONUS = {
  xpBoost: 0.5,
  staminaBonus: 0.5,
  doubleXp: 1.0,
  boostedCreature: 1.0,
} as const;

/** Compute the cumulative multiplier from active modifiers. */
export function modifierMultiplier(mods: LevelingModifiers): number {
  let m = 1;
  if (mods.xpBoost)         m *= 1 + MODIFIER_BONUS.xpBoost;
  if (mods.staminaBonus)    m *= 1 + MODIFIER_BONUS.staminaBonus;
  if (mods.doubleXp)        m *= 1 + MODIFIER_BONUS.doubleXp;
  if (mods.boostedCreature) m *= 1 + MODIFIER_BONUS.boostedCreature;
  return m;
}

export function validateLevelingInput(input: LevelingInput): string | null {
  const LEVEL_CAP = 5000;
  if (!Number.isFinite(input.currentLevel) || input.currentLevel < 1) {
    return "Enter your current level";
  }
  if (input.currentLevel > LEVEL_CAP) return `Current level max ${LEVEL_CAP}`;
  if (!Number.isFinite(input.currentExp) || input.currentExp < 0) {
    return "Enter your current experience";
  }
  if (!Number.isFinite(input.targetLevel) || input.targetLevel < 2) {
    return "Enter a target level";
  }
  if (input.targetLevel > LEVEL_CAP) return `Target level max ${LEVEL_CAP}`;
  if (input.targetLevel <= input.currentLevel) {
    return "Target must be higher than current";
  }
  if (!Number.isFinite(input.creatureBaseExp) || input.creatureBaseExp <= 0) {
    return "Pick a creature";
  }
  return null;
}

export function computeLeveling(
  input: LevelingInput,
): LevelingResult | null {
  if (validateLevelingInput(input)) return null;

  const targetTotal = expFor(input.targetLevel);
  const expRemaining = Math.max(0, targetTotal - input.currentExp);

  const multiplier = modifierMultiplier(input.modifiers);
  const effectiveExpPerKill = input.creatureBaseExp * multiplier;
  if (effectiveExpPerKill <= 0) return null;

  const creaturesNeeded = Math.ceil(expRemaining / effectiveExpPerKill);

  return {
    expRemaining,
    multiplier,
    effectiveExpPerKill,
    creaturesNeeded,
  };
}
