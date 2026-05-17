/**
 * Reference creatures for the Leveling Calculator.
 *
 * Curated list of 17 iconic Tibia creatures spanning the full level
 * curve. The order matters — the calc preselects the creature whose
 * range covers the player's current level.
 *
 * baseExp values reflect the in-game experience reward per kill BEFORE
 * any modifiers (XP Boost, Stamina, Double XP, Boosted Creature).
 * Owner-supplied list; verify any disputed value against TibiaWiki:
 *   https://tibia.fandom.com/wiki/Creatures
 */

export interface LevelingCreature {
  /** Display name — must match the in-game spelling so search works. */
  name: string;
  /** Experience reward per kill at base rate. */
  baseExp: number;
  /** Suggested level range where this creature is the typical hunt. */
  range: { min: number; max: number };
}

export const LEVELING_CREATURES: readonly LevelingCreature[] = [
  { name: "Tarantula",      baseExp: 120,  range: { min: 0,   max: 25  } },
  { name: "Dragon",         baseExp: 700,  range: { min: 25,  max: 50  } },
  { name: "Dragon Lord",    baseExp: 2100, range: { min: 50,  max: 75  } },
  { name: "Hydra",          baseExp: 2100, range: { min: 75,  max: 100 } },
  { name: "Nightmare",      baseExp: 2150, range: { min: 100, max: 125 } },
  { name: "Behemoth",       baseExp: 2250, range: { min: 125, max: 150 } },
  { name: "Medusa",         baseExp: 1800, range: { min: 150, max: 175 } },
  { name: "Elder Wyrm",     baseExp: 3000, range: { min: 175, max: 200 } },
  { name: "Demon",          baseExp: 6000, range: { min: 200, max: 250 } },
  { name: "Grim Reaper",    baseExp: 4000, range: { min: 250, max: 300 } },
  { name: "Dark Torturer",  baseExp: 4400, range: { min: 300, max: 350 } },
  { name: "Juggernaut",     baseExp: 6000, range: { min: 350, max: 400 } },
  { name: "Hellhound",      baseExp: 7200, range: { min: 400, max: 450 } },
  { name: "Guzzlemaw",      baseExp: 4400, range: { min: 450, max: 500 } },
  { name: "Vexclaw",        baseExp: 3150, range: { min: 500, max: 600 } },
  { name: "Hellflayer",     baseExp: 6400, range: { min: 600, max: 700 } },
  { name: "Infernal Demon", baseExp: 8200, range: { min: 700, max: 9999 } },
] as const;

/** Find the creature whose range covers the given level (first match). */
export function suggestCreatureForLevel(
  level: number,
): LevelingCreature | null {
  if (!Number.isFinite(level) || level < 0) return null;
  for (const c of LEVELING_CREATURES) {
    if (level >= c.range.min && level <= c.range.max) return c;
  }
  return null;
}
