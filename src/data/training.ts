/**
 * Training calculator constants.
 *
 * Sources:
 *  - Sorc/Druid Magic, Knight Melee, Paladin Distance, Paladin Magic, Monk Magic,
 *    Monk Fist constants are TibiaPal-verified (their exercise.js source).
 *  - Knight Magic constant is OUR derivation, calibrated against the world record
 *    Knight (Lvl 1943, ML 15) which took 5+ years of accumulated active + offline play.
 *    See methodology page for the math.
 *
 *  - Exercise weapon stats (points, TC cost, time-per-weapon) are from TibiaPal's
 *    exercise.js comment: "Each weapon is equivalent to 300k mana points - 600
 *    ultimate mana potions × 500 average value, and all vocs progress their main
 *    skill at the same rate with the weapons".
 */

export const SKILL_CONSTANT = 1600;

export const EXERCISE_WEAPONS = {
  regular: { points: 300_000, costTC: 25, hoursPerWeapon: 1 / 3.6 },
  durable: { points: 1_080_000, costTC: 90, hoursPerWeapon: 1 },
  lasting: { points: 8_640_000, costTC: 720, hoursPerWeapon: 8 },
} as const;

export type WeaponType = keyof typeof EXERCISE_WEAPONS;

export const WEAPON_ORDER: readonly WeaponType[] = ["regular", "durable", "lasting"];

export interface TrainableSkill {
  skill: string;
  vocationConstant: number;
  warning?: string;
}

/**
 * Skills trainable with exercise weapons, by vocation. Shielding and Fishing
 * are intentionally absent — exercise weapons cannot raise those.
 */
export const TRAINING_BY_VOCATION: Record<string, readonly TrainableSkill[]> = {
  knight: [
    { skill: "Sword", vocationConstant: 1.1 },
    { skill: "Axe", vocationConstant: 1.1 },
    { skill: "Club", vocationConstant: 1.1 },
    {
      skill: "Magic level",
      vocationConstant: 3.0,
      warning:
        "Knight Magic with exercise weapons is impractical. World record is ML 15 at Knight Level 1943, accumulated over years. Calculator provided for reference.",
    },
  ],
  paladin: [
    { skill: "Distance", vocationConstant: 1.1 },
    { skill: "Magic level", vocationConstant: 1.4 },
  ],
  sorcerer: [
    { skill: "Magic level", vocationConstant: 1.1 },
  ],
  druid: [
    { skill: "Magic level", vocationConstant: 1.1 },
  ],
  monk: [
    { skill: "Fist", vocationConstant: 1.1 },
    { skill: "Magic level", vocationConstant: 1.25 },
  ],
};
