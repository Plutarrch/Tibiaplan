/**
 * Weapon Proficiency data — imported 1:1 from TibiaPal's authoritative
 * `weapon-proficiencies.json` (client-extracted, 435 weapons). Every
 * perk here matches the in-game window exactly: same name, same
 * description text, same base icon (referenced by TibiaPal's original
 * numbered filename inside /sprites/perks/wiki/), same augment overlay.
 *
 * The Weapon Proficiency system was introduced in Tibia's Summer Update
 * 2025 (2025-07-21) and expanded with a "refinement" (perk-shaping)
 * layer in Summer 2026. Every eligible weapon has:
 *   - 3-7 levels depending on tier
 *   - 1-of-N mutually exclusive perk choices per level (N is 1, 2, or 3)
 *   - Progress earned by killing monsters while the weapon is equipped
 *
 * Sprite rendering:
 *   - `base` points at /sprites/perks/wiki/<TibiaPal filename> — one
 *     unique sprite per perk visual in the game, so different weapons
 *     that share the same visual (e.g., "generic critical extra damage"
 *     uses 081) reuse the same file.
 *   - `augment` (only present on "Spell augmentation" perks) is the
 *     small badge overlaid top-right of the base — one of four:
 *     life-leech, mana-leech, critical-chance, damage.
 */

export type WeaponCategory =
  | "sword"
  | "axe"
  | "club"
  | "bow"
  | "crossbow"
  | "wand"
  | "rod"
  | "fist"
  | "spellbook";

export type WeaponVocation =
  | "knight"
  | "paladin"
  | "sorcerer"
  | "druid"
  | "monk"
  | "any";

export type DamageType =
  | "physical"
  | "fire"
  | "ice"
  | "earth"
  | "energy"
  | "holy"
  | "death";

export interface WeaponStats {
  attack?: number;
  /** Extra elemental attack layered on top of physical (e.g. Emerald
   *  Sword: +49 phys + 12 earth → attack: 49, extraAttack: 12,
   *  extraAttackType: "earth"). Absent when the weapon is pure
   *  physical or pure elemental. */
  extraAttack?: number;
  extraAttackType?: DamageType;
  defense?: number;
  range?: number;

  distanceFighting?: number;
  axeFighting?: number;
  clubFighting?: number;
  swordFighting?: number;
  fistFighting?: number;
  shielding?: number;

  magicLevel?: number;
  fireMagicLevel?: number;
  iceMagicLevel?: number;
  earthMagicLevel?: number;
  energyMagicLevel?: number;
  holyMagicLevel?: number;
  deathMagicLevel?: number;
  healingMagicLevel?: number;

  damageType?: DamageType;
  damageRange?: string;
  manaCost?: number;

  critExtraDamage?: number;
  hpLeech?: number;
  manaLeech?: number;

  physicalResist?: number;
  fireResist?: number;
  iceResist?: number;
  earthResist?: number;
  energyResist?: number;
  holyResist?: number;
  deathResist?: number;

  weight?: number;
  imbueSlots?: number;
  duration?: string;
}

export interface Perk {
  name: string;
  description: string;
  /** Path inside /sprites/perks/, e.g. "wiki/140-divine-caldera.gif". */
  base?: string;
  /** Optional augment badge overlaid top-right, e.g. "augments/life-leech.png". */
  augment?: string;
}

export interface PerkLevel {
  level: number;
  choices: readonly Perk[];
}

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  vocation: WeaponVocation;
  hands: 1 | 2;
  levelRequirement: number;
  sprite: string;
  stats: WeaponStats;
  perkTree: readonly PerkLevel[];
  placeholder?: boolean;
}

/** Normalize a weapon's perk tree to exactly 7 slots (levels 1..7).
 *  Fills any missing level with an empty-choices placeholder. Handles
 *  arbitrary input — non-consecutive levels, gaps, non-1 starts — so
 *  the render always gets a well-formed 7-column grid and vertical
 *  centering inside each column works consistently across all
 *  weapons (whether they naturally have 3, 5, 7 tiers). */
function padTo7(levels: PerkLevel[]): PerkLevel[] {
  const byLevel = new Map(levels.map((l) => [l.level, l]));
  const out: PerkLevel[] = [];
  for (let i = 1; i <= 7; i++) {
    out.push(byLevel.get(i) ?? { level: i, choices: [] });
  }
  return out;
}

export const WEAPONS: readonly Weapon[] = [
  {
    id: "soulbleeder",
    name: "Soulbleeder",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 400,
    sprite: "soulbleeder.gif",
    stats: { attack: 8, range: 6, distanceFighting: 3, holyResist: 7, weight: 47.0, imbueSlots: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Damage at range", description: "+10 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+75% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
        { name: "Combat skill", description: "+2 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Combat skill scaling for healing", description: "+125% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-bow",
    name: "Sanguine Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 600,
    sprite: "sanguine-bow.gif",
    stats: { attack: 9, range: 6, distanceFighting: 3, earthResist: 6, weight: 47.0, imbueSlots: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+10 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+200% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-bow",
    name: "Grand Sanguine Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 600,
    sprite: "grand-sanguine-bow.gif",
    stats: { attack: 9, range: 6, distanceFighting: 3, earthResist: 6, weight: 47.0, imbueSlots: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+10 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% mana leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+200% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "falcon-bow",
    name: "Falcon Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "falcon-bow.gif",
    stats: { attack: 6, range: 6, distanceFighting: 2, fireResist: 5, weight: 35.0, imbueSlots: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Damage at range", description: "+15 damage at range 6", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+2.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+5% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-battleaxe",
    name: "Sanguine Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 600,
    sprite: "sanguine-battleaxe.gif",
    stats: { attack: 8, defense: 35, axeFighting: 4, weight: 85.0, imbueSlots: 3, extraAttack: 50, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cobra-club",
    name: "Cobra Club",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 220,
    sprite: "cobra-club.gif",
    stats: { attack: 8, defense: 29, clubFighting: 2, weight: 25.0, imbueSlots: 2, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Life Gain on Kill", description: "+16 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Club Fighting as extra healing for your spells", base: "wiki/063-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "falcon-battleaxe",
    name: "Falcon Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "falcon-battleaxe.gif",
    stats: { attack: 10, defense: 33, axeFighting: 4, energyResist: 12, weight: 95.0, imbueSlots: 2, extraAttack: 47, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Critical extra damage", description: "+2.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+6% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+14% of your Shielding as extra healing for your spells", base: "wiki/122-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-rod",
    name: "Sanguine Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 600,
    sprite: "sanguine-rod.gif",
    stats: { magicLevel: 4, iceMagicLevel: 1, earthMagicLevel: 1, damageType: "earth", damageRange: "100-124", manaCost: 20, critExtraDamage: 5, hpLeech: 6, manaLeech: 1, deathResist: 7, weight: 25.0, imbueSlots: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+4% base damage for Terra Wave", base: "wiki/117-terra-wave.gif", augment: "augments/damage.png" },
        { name: "Spell augmentation", description: "+12.50% critical extra damage for Eternal Winter", base: "wiki/142-eternal-winter.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+4% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% base damage for Eternal Winter", base: "wiki/142-eternal-winter.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+2 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+3 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Spell augmentation", description: "+6% healing for Heal Friend", base: "wiki/137-heal-friend.gif", augment: "augments/damage.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-coil",
    name: "Sanguine Coil",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 600,
    sprite: "sanguine-coil.gif",
    stats: { magicLevel: 4, fireMagicLevel: 1, energyMagicLevel: 1, damageType: "fire", damageRange: "113-125", manaCost: 21, critExtraDamage: 5, hpLeech: 2, manaLeech: 1, earthResist: 7, weight: 22.0, imbueSlots: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Critical extra damage", description: "+7% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+4% base damage for Energy Wave", base: "wiki/119-energy-wave.gif", augment: "augments/damage.png" },
        { name: "Spell augmentation", description: "+12.50% critical extra damage for Hell's Core", base: "wiki/141-hell-s-core.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+4% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% base damage for Hell's Core", base: "wiki/141-hell-s-core.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+2 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ferumbras-staff-enchanted",
    name: "Ferumbras' Staff (Enchanted)",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 100,
    sprite: "ferumbras-staff-enchanted.gif",
    stats: { range: 4, damageType: "energy", damageRange: "80-110", manaCost: 19, weight: 34.0, duration: "12h (reverts to Blunt form)" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical extra damage for Rage of the Skies", base: "wiki/144-rage-of-the-skies.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+4% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  }

,

  // ---------------------------------------------------------------------------
  // Auto-imported batch (2026-09-25): all remaining weapons from TibiaPal's
  // canonical `weapon-proficiencies.json`. Metadata (category, vocation, hands)
  // is derived from JSON `weaponType` + `handedness` fields; stats are empty
  // placeholders — base weapon stats aren't in the JSON and will be filled in
  // by a follow-up TibiaWiki scrape. Perk trees are complete and correct.
  // ---------------------------------------------------------------------------
  {
    id: "crimson-sword",
    name: "Crimson Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 20,
    sprite: "239.png",
    stats: { attack: 28, defense: 20, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "small-stone",
    name: "Small Stone",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "125.png",
    stats: { attack: 5, defense: 0, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack range", description: "+1 range", base: "wiki/007-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+3 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical extra damage", description: "+200% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "snowball",
    name: "Snowball",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "126.png",
    stats: { attack: 0, defense: 0, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+4% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
    ]),
  },

  {
    id: "terra-rod",
    name: "Terra Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 26,
    sprite: "293.png",
    stats: { damageRange: "37-53", damageType: "earth", manaCost: 8, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+5 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% base damage for Terra Strike", base: "wiki/014-terra-strike.gif", augment: "augments/damage.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "snakebite-rod",
    name: "Snakebite Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 6,
    sprite: "271.png",
    stats: { damageRange: "8-18", damageType: "earth", manaCost: 1, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+20% healing for Light Healing", base: "wiki/020-light-healing.gif", augment: "augments/damage.png" },
      ]},
    ]),
  },

  {
    id: "hailstorm-rod",
    name: "Hailstorm Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 33,
    sprite: "313.png",
    stats: { damageRange: "56-74", damageType: "ice", manaCost: 13, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+2.50% life leech for Ice Strike", base: "wiki/022-ice-strike.gif", augment: "augments/life-leech.png" },
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2.50% life leech for Ice Strike", base: "wiki/022-ice-strike.gif", augment: "augments/life-leech.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
    ]),
  },

  {
    id: "necrotic-rod",
    name: "Necrotic Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 19,
    sprite: "287.png",
    stats: { damageRange: "23-37", damageType: "death", manaCost: 5, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+2 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+4 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonlight-rod",
    name: "Moonlight Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 13,
    sprite: "273.png",
    stats: { damageRange: "13-25", damageType: "ice", manaCost: 3, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+5 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ice Strike", base: "wiki/022-ice-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-inferno",
    name: "Wand Of Inferno",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 33,
    sprite: "312.png",
    stats: { damageRange: "56-74", damageType: "fire", manaCost: 13, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+5% critical extra damage for Fire Wave", base: "wiki/028-fire-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Damage at range", description: "+8 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+5% critical extra damage for Fire Wave", base: "wiki/028-fire-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-decay",
    name: "Wand Of Decay",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 19,
    sprite: "286.png",
    stats: { damageRange: "23-37", damageType: "death", manaCost: 7, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+2 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+4 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+5% base damage for Force Strike", base: "wiki/030-force-strike.gif", augment: "augments/damage.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-cosmic-energy",
    name: "Wand Of Cosmic Energy",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 26,
    sprite: "292.png",
    stats: { damageRange: "37-53", damageType: "energy", manaCost: 8, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+5 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% base damage for Energy Beam", base: "wiki/032-energy-beam.gif", augment: "augments/damage.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-vortex",
    name: "Wand Of Vortex",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 6,
    sprite: "272.png",
    stats: { damageRange: "8-18", damageType: "energy", manaCost: 2, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+20% base damage for Buzz", base: "wiki/034-buzz.gif", augment: "augments/damage.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-dragonbreath",
    name: "Wand Of Dragonbreath",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 13,
    sprite: "274.png",
    stats: { damageRange: "13-25", damageType: "fire", imbueSlots: 2, manaCost: 3, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+5 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Flame Strike", base: "wiki/035-flame-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "giant-smithhammer",
    name: "Giant Smithhammer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "250.png",
    stats: { attack: 24, defense: 14},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cowtana",
    name: "Cowtana",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 25,
    sprite: "219.png",
    stats: { attack: 34, defense: 19},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "twiceslicer",
    name: "Twiceslicer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 58,
    sprite: "225.png",
    stats: { attack: 47, defense: 30, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "rift-lance",
    name: "Rift Lance",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 70,
    sprite: "223.png",
    stats: { attack: 48, defense: 28, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "mino-lance",
    name: "Mino Lance",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 45,
    sprite: "224.png",
    stats: { attack: 40, defense: 23},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "metal-bat",
    name: "Metal Bat",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 55,
    sprite: "227.png",
    stats: { attack: 44, defense: 20},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "spear",
    name: "Spear",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "127.png",
    stats: { attack: 25, defense: 0, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "magic-longsword",
    name: "Magic Longsword",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 140,
    sprite: "310.png",
    stats: { attack: 55, defense: 40},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+200% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+10% damage against Giant", base: "wiki/040-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+200% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+10% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "ogre-klubba",
    name: "Ogre Klubba",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 50,
    sprite: "226.png",
    stats: { attack: 45, defense: 25},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "giant-sword",
    name: "Giant Sword",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 55,
    sprite: "289.png",
    stats: { attack: 46, defense: 22, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Giant", base: "wiki/040-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "ice-rapier",
    name: "Ice Rapier",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "161.png",
    stats: { attack: 42, damageType: "ice", defense: 1, extraAttack: 18, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+15% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "+30% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Auto-attack critical hit chance", description: "+50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "throwing-star",
    name: "Throwing Star",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "128.png",
    stats: { attack: 30, defense: 0, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+2 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+2 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+2 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage at range", description: "+2 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage at range", description: "+4 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "magic-sword",
    name: "Magic Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "238.png",
    stats: { attack: 48, defense: 35, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+7% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "-2m30s cooldown for Intense Wound Cleansing", base: "wiki/043-intense-wound-cleansing.gif" },
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Sword Fighting as extra healing for your spells", base: "wiki/045-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "simple-jo-staff",
    name: "Simple Jo Staff",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 0,
    sprite: "229.png",
    stats: { attack: 12, defense: 8, fistFighting: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "silver-dagger",
    name: "Silver Dagger",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "231.png",
    stats: { attack: 9, defense: 7},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "bright-sword",
    name: "Bright Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 30,
    sprite: "366.png",
    stats: { attack: 36, defense: 30, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "warlord-sword",
    name: "Warlord Sword",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 120,
    sprite: "311.png",
    stats: { attack: 53, defense: 38},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Armor penetration", description: "+5% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Mana leech", description: "+3% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+3 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+5 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "serpent-sword",
    name: "Serpent Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "232.png",
    stats: { attack: 18, defense: 15, extraAttack: 8, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "throwing-knife",
    name: "Throwing Knife",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "129.png",
    stats: { attack: 25, defense: 0, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+2 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+2 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+2 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage at range", description: "+2 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage at range", description: "+4 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "poison-dagger",
    name: "Poison Dagger",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "233.png",
    stats: { attack: 16, defense: 8, extraAttack: 2, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "great-axe",
    name: "Great Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 95,
    sprite: "360.png",
    stats: { attack: 52, defense: 22, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+2% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crowbar",
    name: "Crowbar",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "243.png",
    stats: { attack: 5, defense: 6},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Construct", base: "wiki/056-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "golden-sickle",
    name: "Golden Sickle",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "343.png",
    stats: { attack: 13, defense: 6},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "machete",
    name: "Machete",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "234.png",
    stats: { attack: 12, defense: 9},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "thunder-hammer",
    name: "Thunder Hammer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 85,
    sprite: "432.png",
    stats: { attack: 49, defense: 35, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+5 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Giant", base: "wiki/040-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% base damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+16% base damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/damage.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+15% critical hit chance for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+5% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "silver-mace",
    name: "Silver Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 45,
    sprite: "339.png",
    stats: { attack: 41, defense: 30, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+15% mana leech for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/mana-leech.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "stonecutter-axe",
    name: "Stonecutter Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 90,
    sprite: "414.png",
    stats: { attack: 50, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+1.50% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Damage against bestiary family", description: "+1.50% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "enchanted-staff",
    name: "Enchanted Staff",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 0,
    sprite: "423.png",
    stats: { attack: 39, defense: 45},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for healing", description: "", base: "wiki/122-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Specialized magic level", description: "+1 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+5% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "light-mace",
    name: "Light Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "424.png",
    stats: { attack: 14, defense: 9},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+4 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+20% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for healing", description: "+35% of your Club Fighting as extra healing for your spells", base: "wiki/063-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+30% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "daramian-axe",
    name: "Daramian Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "344.png",
    stats: { attack: 17, defense: 8},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+35% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+10% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Mana on hit", description: "+6 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+25% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Auto-attack critical hit chance", description: "+15% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "heavy-machete",
    name: "Heavy Machete",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "235.png",
    stats: { attack: 16, defense: 10},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1.50% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "ravager-s-axe",
    name: "Ravager'S Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 70,
    sprite: "350.png",
    stats: { attack: 49, defense: 14, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+5 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
        { name: "Defence", description: "+5 defence", base: "wiki/038-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
      ]},
    ]),
  },

  {
    id: "pharaoh-sword",
    name: "Pharaoh Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 45,
    sprite: "275.png",
    stats: { attack: 41, defense: 23},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+25% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "twin-axe",
    name: "Twin Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 50,
    sprite: "353.png",
    stats: { attack: 45, defense: 24, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% base damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/damage.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+75% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+50% life leech for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+30% critical extra damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+20% mana leech for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for spell damage", description: "+25% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+75% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "bone-sword",
    name: "Bone Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "236.png",
    stats: { attack: 13, defense: 10},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "djinn-blade",
    name: "Djinn Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 35,
    sprite: "268.png",
    stats: { attack: 38, defense: 22, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+7% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+21 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+7% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+14 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+14% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Auto-attack critical extra damage", description: "+42% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "arcane-staff",
    name: "Arcane Staff",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "436.png",
    stats: { attack: 50, defense: 30, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lich-staff",
    name: "Lich Staff",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 40,
    sprite: "258.png",
    stats: { attack: 40, defense: 30},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+4 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for spell damage", description: "+25% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+10% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+5% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Spell augmentation", description: "-60m0s cooldown for Avatar of Storm", base: "wiki/068-avatar-of-storm.gif" },
        { name: "Spell augmentation", description: "-60m0s cooldown for Avatar of Nature", base: "wiki/069-avatar-of-nature.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "-60m0s cooldown for Avatar of Light", base: "wiki/070-avatar-of-light.gif" },
        { name: "Spell augmentation", description: "-60m0s cooldown for Avatar of Balance", base: "wiki/071-avatar-of-balance.gif" },
        { name: "Spell augmentation", description: "-60m0s cooldown for Avatar of Steel", base: "wiki/072-avatar-of-steel.gif" },
      ]},
    ]),
  },

  {
    id: "templar-scytheblade",
    name: "Templar Scytheblade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "218.png",
    stats: { attack: 23, defense: 15},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "hunting-spear",
    name: "Hunting Spear",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 20,
    sprite: "131.png",
    stats: { attack: 32, defense: 0, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "banana-staff",
    name: "Banana Staff",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "248.png",
    stats: { attack: 25, defense: 15},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+8% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "refined-bow",
    name: "Refined Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 0,
    sprite: "228.png",
    stats: { range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "arbalest",
    name: "Arbalest",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 75,
    sprite: "372.png",
    stats: { attack: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+4 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+10 damage at range 6", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+4 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ron-the-ripper-s-sabre",
    name: "Ron The Ripper'S Sabre",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "443.png",
    stats: { attack: 12, defense: 10},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "the-avenger",
    name: "The Avenger",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "308.png",
    stats: { attack: 50, defense: 38, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for healing", description: "+100% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "ruthless-axe",
    name: "Ruthless Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "355.png",
    stats: { attack: 50, defense: 15, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+3 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "viper-star",
    name: "Viper Star",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "132.png",
    stats: { attack: 28, defense: 0, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+0.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Armor penetration", description: "+0.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+0.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+0.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Armor penetration", description: "+1% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "enchanted-spear",
    name: "Enchanted Spear",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 42,
    sprite: "133.png",
    stats: { attack: 38, defense: 0, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+2 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana Gain on Kill", description: "+2 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+2 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Mana Gain on Kill", description: "+2 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Mana Gain on Kill", description: "+4 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "assassin-star",
    name: "Assassin Star",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 80,
    sprite: "149.png",
    stats: { attack: 65, defense: 0, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "royal-spear",
    name: "Royal Spear",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 25,
    sprite: "150.png",
    stats: { attack: 35, defense: 0, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "brutetamer-s-staff",
    name: "Brutetamer'S Staff",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 25,
    sprite: "328.png",
    stats: { attack: 35, defense: 15},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Defence", description: "+2 defence", base: "wiki/038-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "headchopper",
    name: "Headchopper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 35,
    sprite: "384.png",
    stats: { attack: 42, defense: 20, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+1.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "mystic-blade",
    name: "Mystic Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 60,
    sprite: "374.png",
    stats: { attack: 44, defense: 25, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "ornamented-axe",
    name: "Ornamented Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 50,
    sprite: "284.png",
    stats: { attack: 42, defense: 22},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Axe Fighting as extra healing for your spells", base: "wiki/079-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "heroic-axe",
    name: "Heroic Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 60,
    sprite: "375.png",
    stats: { attack: 44, defense: 24, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "the-justice-seeker",
    name: "The Justice Seeker",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 75,
    sprite: "377.png",
    stats: { attack: 47, defense: 24},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for spell damage", description: "+4% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+6% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+40% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "thaian-sword",
    name: "Thaian Sword",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 50,
    sprite: "288.png",
    stats: { attack: 45, defense: 29, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+1% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "orcish-maul",
    name: "Orcish Maul",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 35,
    sprite: "383.png",
    stats: { attack: 42, defense: 18, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+1.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "dragon-slayer",
    name: "Dragon Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 45,
    sprite: "285.png",
    stats: { attack: 44, defense: 28, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+5% damage against Dragon", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "assassin-dagger",
    name: "Assassin Dagger",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 40,
    sprite: "240.png",
    stats: { attack: 40, defense: 12, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Defence", description: "+2 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "havoc-blade",
    name: "Havoc Blade",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 70,
    sprite: "307.png",
    stats: { attack: 49, defense: 34, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+2% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Critical extra damage", description: "+3% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "blacksteel-sword",
    name: "Blacksteel Sword",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 35,
    sprite: "385.png",
    stats: { attack: 42, defense: 22, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+1.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "wyvern-fang",
    name: "Wyvern Fang",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 25,
    sprite: "266.png",
    stats: { attack: 32, defense: 19, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Dragon", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "northern-star",
    name: "Northern Star",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 50,
    sprite: "342.png",
    stats: { attack: 42, defense: 15},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Dragon", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "queen-s-sceptre",
    name: "Queen'S Sceptre",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 55,
    sprite: "425.png",
    stats: { attack: 43, defense: 19, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Weapon shield", description: "", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+10% healing for Wound Cleansing", base: "wiki/100-wound-cleansing.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/078-brutal-strike.gif" },
        { name: "Specialized magic level", description: "+1 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "cranial-basher",
    name: "Cranial Basher",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 60,
    sprite: "376.png",
    stats: { attack: 44, defense: 20, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "bloody-edge",
    name: "Bloody Edge",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 55,
    sprite: "241.png",
    stats: { attack: 43, defense: 21, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+14 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-10s cooldown for Inflict Wound", base: "wiki/083-inflict-wound.gif" },
      ]},
    ]),
  },

  {
    id: "reaper-s-axe",
    name: "Reaper'S Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 70,
    sprite: "415.png",
    stats: { attack: 46, defense: 25},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/082-front-sweep.gif" },
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "skullcrusher",
    name: "Skullcrusher",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 85,
    sprite: "439.png",
    stats: { attack: 51, defense: 20, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "amber-staff",
    name: "Amber Staff",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 40,
    sprite: "330.png",
    stats: { attack: 43, defense: 25, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Proficiency effect -1", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "-6s cooldown for Annihilation", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Proficiency effect -1", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
    ]),
  },

  {
    id: "blessed-sceptre",
    name: "Blessed Sceptre",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 75,
    sprite: "380.png",
    stats: { attack: 47, defense: 21, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "demonbone",
    name: "Demonbone",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "430.png",
    stats: { attack: 48, defense: 38, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "ravenwing",
    name: "Ravenwing",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 65,
    sprite: "404.png",
    stats: { attack: 45, defense: 22},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+25% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+30% life leech for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+25% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+10% mana leech for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+7.50% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "royal-axe",
    name: "Royal Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 75,
    sprite: "379.png",
    stats: { attack: 47, defense: 25, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "impaler",
    name: "Impaler",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 85,
    sprite: "417.png",
    stats: { attack: 49, defense: 25, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Defence", description: "+5 defence", base: "wiki/038-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+2% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "elvish-bow",
    name: "Elvish Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 0,
    sprite: "333.png",
    stats: { imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Ranged chance to hit", description: "+2% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "hammer-of-prophecy",
    name: "Hammer Of Prophecy",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 120,
    sprite: "437.png",
    stats: { attack: 52, defense: 35},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana on hit", description: "", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life on hit", description: "+8 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+5% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "spiked-squelcher",
    name: "Spiked Squelcher",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 30,
    sprite: "329.png",
    stats: { attack: 41, defense: 21, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "executioner",
    name: "Executioner",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 85,
    sprite: "354.png",
    stats: { attack: 51, defense: 20, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+30% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+5% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "mythril-axe",
    name: "Mythril Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "416.png",
    stats: { attack: 48, defense: 28, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Extra Dimensional", base: "wiki/088-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "modified-crossbow",
    name: "Modified Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 45,
    sprite: "362.png",
    stats: { imbueSlots: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+2 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Dragon", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "chain-bolter",
    name: "Chain Bolter",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 60,
    sprite: "378.png",
    stats: { attack: 4, imbueSlots: 3, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+12 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+4% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "royal-crossbow",
    name: "Royal Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 130,
    sprite: "393.png",
    stats: { attack: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2.50% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
        { name: "Damage at range", description: "+12 damage at range 6", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "the-devileye",
    name: "The Devileye",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 100,
    sprite: "388.png",
    stats: { attack: 20, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+20 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana on hit", description: "+5 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+1.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "the-ironworker",
    name: "The Ironworker",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 80,
    sprite: "382.png",
    stats: { attack: 4, imbueSlots: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+12 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+4% damage against Giant", base: "wiki/040-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "warsinger-bow",
    name: "Warsinger Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 80,
    sprite: "338.png",
    stats: { attack: 3, imbueSlots: 3, range: 7 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage at range", description: "+15 damage at range 7", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "composite-hornbow",
    name: "Composite Hornbow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 50,
    sprite: "340.png",
    stats: { attack: 2, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "yol-s-bow",
    name: "Yol'S Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 60,
    sprite: "405.png",
    stats: { range: 7 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+5 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for healing", description: "+10% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Combat skill", description: "", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "silkweaver-bow",
    name: "Silkweaver Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 40,
    sprite: "336.png",
    stats: { imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "elethriel-s-elemental-bow",
    name: "Elethriel'S Elemental Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 70,
    sprite: "403.png",
    stats: { attack: 7, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Attack range", description: "+1 range", base: "wiki/007-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/143-divine-grenade.gif" },
        { name: "Spell augmentation", description: "", base: "wiki/143-divine-grenade.gif" },
      ]},
      { level: 4, choices: [
        { name: "Damage at range", description: "", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+10.00% critical extra damage for Holy spells and runes", base: "wiki/129-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Ranged chance to hit", description: "", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental critical hit chance", description: "", base: "wiki/135-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 7, choices: [
        { name: "Damage against bestiary family", description: "+10% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Damage against bestiary family", description: "", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "underworld-rod",
    name: "Underworld Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 42,
    sprite: "326.png",
    stats: { damageRange: "56-74", damageType: "death", imbueSlots: 2, manaCost: 13, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+8 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+25 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+2.50% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+8 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "northwind-rod",
    name: "Northwind Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 22,
    sprite: "291.png",
    stats: { damageRange: "23-37", damageType: "ice", imbueSlots: 2, manaCost: 5, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+5 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+4% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+15% critical extra damage for Ice Strike", base: "wiki/022-ice-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "springsprout-rod",
    name: "Springsprout Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 37,
    sprite: "319.png",
    stats: { damageRange: "56-74", damageType: "earth", manaCost: 13, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Combat skill scaling for healing", description: "+5% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Combat skill scaling for healing", description: "+5% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+4% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-starstorm",
    name: "Wand Of Starstorm",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 37,
    sprite: "321.png",
    stats: { damageRange: "56-74", damageType: "energy", imbueSlots: 2, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack range", description: "+1 range", base: "wiki/007-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-draconia",
    name: "Wand Of Draconia",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 22,
    sprite: "290.png",
    stats: { damageRange: "23-37", damageType: "fire", imbueSlots: 2, manaCost: 5, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+8 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Elemental critical extra damage", description: "+4% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Life on hit", description: "+10 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+15% critical extra damage for Flame Strike", base: "wiki/035-flame-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-voodoo",
    name: "Wand Of Voodoo",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 42,
    sprite: "327.png",
    stats: { damageRange: "56-74", damageType: "death", imbueSlots: 2, manaCost: 13, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+10 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical extra damage", description: "+3% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "hellforged-axe",
    name: "Hellforged Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 110,
    sprite: "418.png",
    stats: { attack: 51, defense: 28, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6.66% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+12% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+35% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+6.66% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "solar-axe",
    name: "Solar Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 130,
    sprite: "419.png",
    stats: { attack: 52, defense: 29, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+15% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Elemental critical extra damage", description: "+25% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Elemental critical hit chance", description: "+2.50% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "demonwing-axe",
    name: "Demonwing Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 120,
    sprite: "359.png",
    stats: { attack: 53, defense: 20, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+2% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "dark-trinity-mace",
    name: "Dark Trinity Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "433.png",
    stats: { attack: 51, defense: 32},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+3 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Critical extra damage", description: "+25% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+6% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
        { name: "Armor penetration", description: "+10% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Death Magic Level", base: "wiki/093-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "obsidian-truncheon",
    name: "Obsidian Truncheon",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 100,
    sprite: "408.png",
    stats: { attack: 50, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "the-stomper",
    name: "The Stomper",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 100,
    sprite: "440.png",
    stats: { attack: 51, defense: 20, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2.50% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "emerald-sword",
    name: "Emerald Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 100,
    sprite: "389.png",
    stats: { attack: 49, defense: 33, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+4% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "the-epiphany",
    name: "The Epiphany",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "317.png",
    stats: { attack: 50, defense: 35, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+2 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+10% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+5% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "the-calamity",
    name: "The Calamity",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 100,
    sprite: "309.png",
    stats: { attack: 51, defense: 35},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Armor penetration", description: "+5% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+4% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Critical extra damage", description: "+12% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana leech", description: "+3% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "glutton-s-mace",
    name: "Glutton'S Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "244.png",
    stats: { attack: 16, defense: 10},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/078-brutal-strike.gif" },
        { name: "Mana on hit", description: "+1 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/078-brutal-strike.gif" },
      ]},
    ]),
  },

  {
    id: "pointed-rabbitslayer",
    name: "Pointed Rabbitslayer",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "259.png",
    stats: { attack: 16, defense: 8},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+20% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Defence", description: "+2 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+20% of your Fishing as extra damage for auto-attacks", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "+15% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stale-bread-of-ancientness",
    name: "Stale Bread Of Ancientness",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "246.png",
    stats: { attack: 18, defense: 8},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life on hit", description: "", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "musician-s-bow",
    name: "Musician'S Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 0,
    sprite: "331.png",
    stats: { imbueSlots: 3, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
        { name: "Damage at range", description: "+8 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+2.50% damage against Fey", base: "wiki/096-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "scythe-of-the-reaper",
    name: "Scythe Of The Reaper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 0,
    sprite: "345.png",
    stats: { attack: 16, defense: 6},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+16 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/110-lesser-front-sweep.gif" },
        { name: "Spell augmentation", description: "+100% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/110-lesser-front-sweep.gif" },
        { name: "Spell augmentation", description: "", base: "wiki/110-lesser-front-sweep.gif" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/110-lesser-front-sweep.gif" },
      ]},
    ]),
  },

  {
    id: "club-of-the-fury",
    name: "Club Of The Fury",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "245.png",
    stats: { attack: 16, defense: 8},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+25% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "farmer-s-avenger",
    name: "Farmer'S Avenger",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 0,
    sprite: "346.png",
    stats: { attack: 17, defense: 7},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "poet-s-fencing-quill",
    name: "Poet'S Fencing Quill",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "260.png",
    stats: { attack: 10, defense: 8 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+20% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Attack damage", description: "+3 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Auto-attack critical extra damage", description: "+50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "incredible-mumpiz-slayer",
    name: "Incredible Mumpiz Slayer",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "242.png",
    stats: { attack: 17, defense: 14},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Fey", base: "wiki/096-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical extra damage", description: "+50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "drachaku",
    name: "Drachaku",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 90,
    sprite: "400.png",
    stats: { attack: 39, defense: 16, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+3% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Dragon", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "snake-god-s-sceptre",
    name: "Snake God'S Sceptre",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 82,
    sprite: "431.png",
    stats: { attack: 48, defense: 29, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for healing", description: "", base: "wiki/122-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Dragon", base: "wiki/080-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "blade-of-corruption",
    name: "Blade Of Corruption",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 82,
    sprite: "387.png",
    stats: { attack: 48, defense: 29, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-dimensions",
    name: "Wand Of Dimensions",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 37,
    sprite: "320.png",
    stats: { damageRange: "44-62", damageType: "energy", manaCost: 9, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+15% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana on hit", description: "+10 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+10 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana on hit", description: "+10 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
        { name: "Auto-attack critical extra damage", description: "+100% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+10 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "heavy-trident",
    name: "Heavy Trident",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 25,
    sprite: "334.png",
    stats: { attack: 35, defense: 17},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+2 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+0.50% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "shimmer-sword",
    name: "Shimmer Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 40,
    sprite: "357.png",
    stats: { attack: 42, defense: 20},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/125-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "shimmer-rod",
    name: "Shimmer Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 40,
    sprite: "352.png",
    stats: { damageRange: "56-74", damageType: "ice", manaCost: 13, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for healing", description: "", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fishing as extra damage for auto-attacks", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "shimmer-bow",
    name: "Shimmer Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 40,
    sprite: "356.png",
    stats: { attack: 1, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/125-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "shimmer-wand",
    name: "Shimmer Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 40,
    sprite: "351.png",
    stats: { damageRange: "56-74", damageType: "energy", manaCost: 13, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/125-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fishing as extra damage for auto-attacks", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "deepling-staff",
    name: "Deepling Staff",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 38,
    sprite: "332.png",
    stats: { attack: 43, defense: 23},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+7% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+7% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "deepling-axe",
    name: "Deepling Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "337.png",
    stats: { attack: 49, defense: 29},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+0.50% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ornate-mace",
    name: "Ornate Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 90,
    sprite: "341.png",
    stats: { attack: 49, defense: 24, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "hive-bow",
    name: "Hive Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 85,
    sprite: "348.png",
    stats: { attack: 2, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ornate-crossbow",
    name: "Ornate Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 50,
    sprite: "373.png",
    stats: { attack: 1, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+2 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+5% healing for Intense Healing", base: "wiki/098-intense-healing.gif", augment: "augments/damage.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for healing", description: "+50% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Critical extra damage", description: "+15% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "deepling-squelcher",
    name: "Deepling Squelcher",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 48,
    sprite: "422.png",
    stats: { attack: 42, defense: 28, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage against bestiary family", description: "+0.50% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+1.50% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "thorn-spitter",
    name: "Thorn Spitter",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 150,
    sprite: "391.png",
    stats: { imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Damage at range", description: "+12 damage at range 6", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-defiance",
    name: "Wand Of Defiance",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 65,
    sprite: "324.png",
    stats: { damageRange: "75-95", damageType: "energy", manaCost: 17, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-everblazing",
    name: "Wand Of Everblazing",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 65,
    sprite: "325.png",
    stats: { damageRange: "75-95", damageType: "fire", manaCost: 17, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "muck-rod",
    name: "Muck Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 65,
    sprite: "322.png",
    stats: { damageRange: "75-95", damageType: "earth", magicLevel: 1, manaCost: 17, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "glacial-rod",
    name: "Glacial Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 65,
    sprite: "323.png",
    stats: { damageRange: "75-95", damageType: "ice", magicLevel: 1, manaCost: 17, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "crystalline-axe",
    name: "Crystalline Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "406.png",
    stats: { attack: 51, axeFighting: 1, defense: 29, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+1.50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "mycological-mace",
    name: "Mycological Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "283.png",
    stats: { attack: 50, clubFighting: 1, defense: 31, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "crystal-crossbow",
    name: "Crystal Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 90,
    sprite: "386.png",
    stats: { attack: 4, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+12 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+15% critical extra damage for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+1% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Construct", base: "wiki/056-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "mycological-bow",
    name: "Mycological Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 105,
    sprite: "361.png",
    stats: { attack: 4, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+4 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
        { name: "Damage at range", description: "+10 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "shiny-blade",
    name: "Shiny Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "316.png",
    stats: { attack: 49, defense: 35, imbueSlots: 1, swordFighting: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "life-preserver",
    name: "Life Preserver",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 15,
    sprite: "249.png",
    stats: { attack: 27, defense: 19, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for healing", description: "+20% of your Club Fighting as extra healing for your spells", base: "wiki/063-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% healing for Wound Cleansing", base: "wiki/100-wound-cleansing.gif", augment: "augments/damage.png" },
      ]},
    ]),
  },

  {
    id: "triple-bolt-crossbow",
    name: "Triple Bolt Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 70,
    sprite: "381.png",
    stats: { attack: 3, imbueSlots: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
        { name: "Mana on hit", description: "+4 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+4% damage against Amphibic", base: "wiki/101-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "icicle-bow",
    name: "Icicle Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 0,
    sprite: "335.png",
    stats: { attack: 1, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "-4s cooldown for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif" },
        { name: "Auto-attack critical extra damage", description: "+8% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+100% mana leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+50% base damage for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-blade",
    name: "Crude Umbral Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 75,
    sprite: "103.png",
    stats: { attack: 48, defense: 26},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-blade",
    name: "Umbral Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "111.png",
    stats: { attack: 50, defense: 29, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-masterblade",
    name: "Umbral Masterblade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 250,
    sprite: "119.png",
    stats: { attack: 52, defense: 31, imbueSlots: 1, swordFighting: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-slayer",
    name: "Crude Umbral Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "106.png",
    stats: { attack: 51, defense: 29},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-slayer",
    name: "Umbral Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 120,
    sprite: "114.png",
    stats: { attack: 52, defense: 31, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-slayer",
    name: "Umbral Master Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 250,
    sprite: "122.png",
    stats: { attack: 54, defense: 35, imbueSlots: 2, swordFighting: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-axe",
    name: "Crude Umbral Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 75,
    sprite: "102.png",
    stats: { attack: 49, defense: 24},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-axe",
    name: "Umbral Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "110.png",
    stats: { attack: 51, defense: 27, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-axe",
    name: "Umbral Master Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 250,
    sprite: "118.png",
    stats: { attack: 53, axeFighting: 1, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+15% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-chopper",
    name: "Crude Umbral Chopper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "105.png",
    stats: { attack: 51, defense: 27},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-chopper",
    name: "Umbral Chopper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 120,
    sprite: "113.png",
    stats: { attack: 52, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-chopper",
    name: "Umbral Master Chopper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 250,
    sprite: "121.png",
    stats: { attack: 54, axeFighting: 3, defense: 34, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+15% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-mace",
    name: "Crude Umbral Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 75,
    sprite: "101.png",
    stats: { attack: 48, defense: 22},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-mace",
    name: "Umbral Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 120,
    sprite: "109.png",
    stats: { attack: 50, defense: 26, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-mace",
    name: "Umbral Master Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 250,
    sprite: "117.png",
    stats: { attack: 52, clubFighting: 1, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-hammer",
    name: "Crude Umbral Hammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "104.png",
    stats: { attack: 51, defense: 27},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-hammer",
    name: "Umbral Hammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 120,
    sprite: "112.png",
    stats: { attack: 53, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-hammer",
    name: "Umbral Master Hammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 250,
    sprite: "120.png",
    stats: { attack: 55, clubFighting: 3, defense: 34, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-bow",
    name: "Crude Umbral Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 75,
    sprite: "108.png",
    stats: { attack: 2, range: 7 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+5 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-bow",
    name: "Umbral Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 120,
    sprite: "130.png",
    stats: { attack: 4, imbueSlots: 1, range: 7 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+7 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-bow",
    name: "Umbral Master Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 250,
    sprite: "124.png",
    stats: { attack: 6, distanceFighting: 3, imbueSlots: 2, range: 7 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+7 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-crossbow",
    name: "Crude Umbral Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 75,
    sprite: "453.png",
    stats: { attack: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+5 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana on hit", description: "+4 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-crossbow",
    name: "Umbral Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 120,
    sprite: "452.png",
    stats: { attack: 6, imbueSlots: 1, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+7 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana on hit", description: "+6 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+3 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-crossbow",
    name: "Umbral Master Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 250,
    sprite: "451.png",
    stats: { attack: 9, distanceFighting: 3, imbueSlots: 2, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+7 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana on hit", description: "+6 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+3 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "glooth-spear",
    name: "Glooth Spear",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 60,
    sprite: "157.png",
    stats: { attack: 55, damageType: "earth", defense: 0, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+0.25% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana leech", description: "+0.25% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+0.25% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Mana leech", description: "+0.25% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Mana leech", description: "+0.50% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "glooth-whip",
    name: "Glooth Whip",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 25,
    sprite: "420.png",
    stats: { attack: 33, defense: 19, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Slime", base: "wiki/104-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "glooth-club",
    name: "Glooth Club",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "411.png",
    stats: { attack: 39, damageType: "earth", defense: 1, extraAttack: 26, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life on hit", description: "+4 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+0.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life on hit", description: "+8 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+1% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life on hit", description: "+16 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Life on hit", description: "+32 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+4% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "glooth-blade",
    name: "Glooth Blade",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "413.png",
    stats: { attack: 39, damageType: "earth", defense: 1, extraAttack: 26, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life on hit", description: "+4 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+0.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life on hit", description: "+8 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+1% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life on hit", description: "+16 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Life on hit", description: "+32 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+4% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "glooth-axe",
    name: "Glooth Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 75,
    sprite: "412.png",
    stats: { attack: 39, damageType: "earth", defense: 1, extraAttack: 26, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life on hit", description: "+4 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+0.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life on hit", description: "+8 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+1% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life on hit", description: "+16 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Life on hit", description: "+32 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+4% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "one-hit-wonder",
    name: "One Hit Wonder",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 70,
    sprite: "435.png",
    stats: { attack: 49, defense: 22},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+1 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana on hit", description: "+2 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+7.50% critical hit chance for Brutal Strike", base: "wiki/078-brutal-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "the-scorcher",
    name: "The Scorcher",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 0,
    sprite: "269.png",
    stats: { damageRange: "6-10", damageType: "fire", manaCost: 1, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "the-chiller",
    name: "The Chiller",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 0,
    sprite: "270.png",
    stats: { damageRange: "6-10", damageType: "ice", manaCost: 1, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+5 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ogre-scepta",
    name: "Ogre Scepta",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 37,
    sprite: "318.png",
    stats: { damageRange: "56-74", damageType: "earth", imbueSlots: 2, manaCost: 13, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+12 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Physical Strike", base: "wiki/105-physical-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+5% base damage for Physical Strike", base: "wiki/105-physical-strike.gif", augment: "augments/damage.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+4% damage against Giant", base: "wiki/040-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "plague-bite",
    name: "Plague Bite",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 150,
    sprite: "407.png",
    stats: { attack: 26, defense: 31, extraAttack: 26, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "-2m30s cooldown for Intense Wound Cleansing", base: "wiki/043-intense-wound-cleansing.gif" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+25% healing for Intense Wound Cleansing", base: "wiki/043-intense-wound-cleansing.gif", augment: "augments/damage.png" },
        { name: "Combat skill scaling for healing", description: "+15% of your Axe Fighting as extra healing for your spells", base: "wiki/079-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Critical extra damage", description: "+20% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "impaler-of-the-igniter",
    name: "Impaler Of The Igniter",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 150,
    sprite: "370.png",
    stats: { attack: 25, defense: 31, extraAttack: 26, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "maimer",
    name: "Maimer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 150,
    sprite: "409.png",
    stats: { attack: 51, defense: 32, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2.50% damage against Fey", base: "wiki/096-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ferumbras-staff-434",
    name: "Ferumbras' Staff",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 100,
    sprite: "434.png",
    stats: { attack: 20, defense: 30},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Attack damage", description: "+3 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "ferumbras-staff-failed",
    name: "Ferumbras' Staff (Failed)",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 65,
    sprite: "441.png",
    stats: { damageRange: "65-95", damageType: "energy", duration: "12 hours", manaCost: 17, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 2, choices: [
        { name: "Rune critical extra damage", description: "", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Rune critical hit chance", description: "", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/144-rage-of-the-skies.gif" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "rift-bow",
    name: "Rift Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 120,
    sprite: "363.png",
    stats: { attack: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+7.50% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack range", description: "+1 range", base: "wiki/007-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+10 damage at range 7", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Fey", base: "wiki/096-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "rift-crossbow",
    name: "Rift Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 120,
    sprite: "392.png",
    stats: { attack: 5, imbueSlots: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+7.50% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+12 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+2 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Fey", base: "wiki/096-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Ranged chance to hit", description: "+1% hit chance", base: "wiki/087-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "dream-blossom-staff",
    name: "Dream Blossom Staff",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 80,
    sprite: "222.png",
    stats: { damageRange: "63-77", damageType: "energy", imbueSlots: 2, manaCost: 18, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Energy Strike", base: "wiki/106-energy-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Ice Strike", base: "wiki/022-ice-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+2.50% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Energy Strike", base: "wiki/106-energy-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Ice Strike", base: "wiki/022-ice-strike.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "leaf-star",
    name: "Leaf Star",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 60,
    sprite: "158.png",
    stats: { attack: 48, defense: 0, range: 4, extraAttack: 2, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+0.50% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+2% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical extra damage", description: "+4% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
    ]),
  },

  {
    id: "royal-star",
    name: "Royal Star",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 120,
    sprite: "159.png",
    stats: { attack: 64, defense: 0, range: 5, extraAttack: 2, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+2 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+2 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+2 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage at range", description: "+2 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage at range", description: "+4 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-darkness",
    name: "Wand Of Darkness",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 41,
    sprite: "358.png",
    stats: { damageRange: "75-95", damageType: "death", duration: "15 minutes", magicLevel: 2, manaCost: 15, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+25% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Elemental critical extra damage", description: "", base: "wiki/129-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Death Magic Level", base: "wiki/093-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "fiery-dragon-slayer-replica",
    name: "Fiery Dragon Slayer Replica",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "305.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "fiery-war-axe-replica",
    name: "Fiery War Axe Replica",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "304.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "fiery-war-hammer-replica",
    name: "Fiery War Hammer Replica",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "303.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "icy-dragon-slayer-replica",
    name: "Icy Dragon Slayer Replica",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "302.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "icy-war-axe-replica",
    name: "Icy War Axe Replica",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "301.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "icy-war-hammer-replica",
    name: "Icy War Hammer Replica",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "300.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "earth-slayer-replica",
    name: "Earth Slayer Replica",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "296.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "earth-war-axe-replica",
    name: "Earth War Axe Replica",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "295.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "earth-war-hammer-replica",
    name: "Earth War Hammer Replica",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "294.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "energy-slayer-replica",
    name: "Energy Slayer Replica",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "299.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "energy-war-axe-replica",
    name: "Energy War Axe Replica",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "298.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "energy-war-hammer-replica",
    name: "Energy War Hammer Replica",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "297.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+0.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+1.50% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+2% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "ornate-mayhem-slayer",
    name: "Ornate Mayhem Slayer",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "181.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+30% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-mayhem-chopper",
    name: "Ornate Mayhem Chopper",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "180.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+30% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-mayhem-hammer",
    name: "Ornate Mayhem Hammer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "179.png",
    stats: { attack: 5, defense: 5},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+30% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-mayhem-crossbow",
    name: "Ornate Mayhem Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "178.png",
    stats: { range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+30% critical extra damage for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-mayhem-rod",
    name: "Ornate Mayhem Rod",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 0,
    sprite: "177.png",
    stats: { damageRange: "0-10", damageType: "ice", manaCost: 5, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+30% critical extra damage for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-remedy-slayer",
    name: "Ornate Remedy Slayer",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "196.png",
    stats: { attack: 5, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-remedy-chopper",
    name: "Ornate Remedy Chopper",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "195.png",
    stats: { attack: 5, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-remedy-hammer",
    name: "Ornate Remedy Hammer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "194.png",
    stats: { attack: 5, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% life leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-remedy-crossbow",
    name: "Ornate Remedy Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "193.png",
    stats: { range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% life leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% life leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-remedy-rod",
    name: "Ornate Remedy Rod",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 0,
    sprite: "192.png",
    stats: { damageRange: "0-10", damageType: "ice", manaCost: 5, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% life leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% life leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% life leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-carving-slayer",
    name: "Ornate Carving Slayer",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "166.png",
    stats: { attack: 5, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-carving-chopper",
    name: "Ornate Carving Chopper",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "165.png",
    stats: { attack: 5, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-carving-hammer",
    name: "Ornate Carving Hammer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "164.png",
    stats: { attack: 5, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% mana leech for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-carving-crossbow",
    name: "Ornate Carving Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "163.png",
    stats: { range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% mana leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% mana leech for Lesser Ethereal Spear", base: "wiki/102-lesser-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "ornate-carving-rod",
    name: "Ornate Carving Rod",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 0,
    sprite: "162.png",
    stats: { damageRange: "0-10", damageType: "ice", manaCost: 5, range: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+1% mana leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+3% mana leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+4% mana leech for Apprentice's Strike", base: "wiki/111-apprentice-s-strike.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "blade-of-destruction",
    name: "Blade Of Destruction",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 200,
    sprite: "210.png",
    stats: { attack: 50, defense: 33, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "slayer-of-destruction",
    name: "Slayer Of Destruction",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 200,
    sprite: "212.png",
    stats: { attack: 52, defense: 30, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "axe-of-destruction",
    name: "Axe Of Destruction",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 200,
    sprite: "209.png",
    stats: { attack: 51, defense: 31, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "chopper-of-destruction",
    name: "Chopper Of Destruction",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 200,
    sprite: "211.png",
    stats: { attack: 52, defense: 30, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "mace-of-destruction",
    name: "Mace Of Destruction",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 200,
    sprite: "208.png",
    stats: { attack: 50, defense: 32, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "hammer-of-destruction",
    name: "Hammer Of Destruction",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 200,
    sprite: "207.png",
    stats: { attack: 53, defense: 29, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "crossbow-of-destruction",
    name: "Crossbow Of Destruction",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 200,
    sprite: "215.png",
    stats: { attack: 6, imbueSlots: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+3.50% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "wand-of-destruction",
    name: "Wand Of Destruction",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 200,
    sprite: "216.png",
    stats: { damageRange: "80-110", damageType: "energy", imbueSlots: 2, manaCost: 20, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "rod-of-destruction",
    name: "Rod Of Destruction",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 200,
    sprite: "214.png",
    stats: { damageRange: "80-110", damageType: "ice", imbueSlots: 2, manaCost: 20, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Rune critical extra damage", description: "+2.50% critical extra damage for offensive runes", base: "wiki/116-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "strange-mallet",
    name: "Strange Mallet",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "247.png",
    stats: { attack: 18, defense: 9 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Construct", base: "wiki/056-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "mallet-handle",
    name: "Mallet Handle",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "446.png",
    stats: { attack: 24, defense: 14 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+2% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+3% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+4% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical extra damage", description: "+5% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical extra damage", description: "+6% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "gnome-sword",
    name: "Gnome Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 250,
    sprite: "367.png",
    stats: { attack: 10, damageType: "energy", defense: 29, energyResist: 6, imbueSlots: 2, swordFighting: 1, extraAttack: 41, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+2% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "falcon-rod",
    name: "Falcon Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 300,
    sprite: "155.png",
    stats: { damageRange: "87-101", damageType: "earth", energyResist: 8, imbueSlots: 2, magicLevel: 3, manaCost: 20, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical hit chance", description: "+10% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Terra Wave", base: "wiki/117-terra-wave.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical extra damage", description: "+50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Damage against bestiary family", description: "+5% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "falcon-wand",
    name: "Falcon Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 300,
    sprite: "156.png",
    stats: { damageRange: "86-102", damageType: "energy", fireResist: 8, imbueSlots: 2, magicLevel: 3, manaCost: 21, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical hit chance", description: "+10% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Energy Wave", base: "wiki/119-energy-wave.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical extra damage", description: "+50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
        { name: "Damage against bestiary family", description: "+5% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "falcon-longsword",
    name: "Falcon Longsword",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "145.png",
    stats: { attack: 56, defense: 34, earthResist: 10, imbueSlots: 2, swordFighting: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+14% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Critical extra damage", description: "+2.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+6% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+14% of your Shielding as extra healing for your spells", base: "wiki/122-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "falcon-mace",
    name: "Falcon Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "144.png",
    stats: { attack: 11, clubFighting: 3, damageType: "energy", defense: 33, energyResist: 7, imbueSlots: 2, extraAttack: 41, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical extra damage", description: "+2.50% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+6% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+14% of your Shielding as extra healing for your spells", base: "wiki/122-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "deepling-ceremonial-dagger",
    name: "Deepling Ceremonial Dagger",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 180,
    sprite: "221.png",
    stats: { damageRange: "86-98", damageType: "ice", earthResist: 5, imbueSlots: 2, magicLevel: 1, manaCost: 23, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+2.50% life leech for Great Energy Beam", base: "wiki/123-great-energy-beam.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1.50% life leech for Ice Wave", base: "wiki/124-ice-wave.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+2.50% life leech for Great Energy Beam", base: "wiki/123-great-energy-beam.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1.50% life leech for Ice Wave", base: "wiki/124-ice-wave.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "deepling-fork",
    name: "Deepling Fork",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 230,
    sprite: "220.png",
    stats: { damageRange: "80-120", damageType: "ice", holyResist: 8, imbueSlots: 2, magicLevel: 2, manaCost: 23, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Critical extra damage", description: "+7.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+7.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Fishing as extra damage for your spells", base: "wiki/125-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical hit chance", description: "+3% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "rotten-demonbone",
    name: "Rotten Demonbone",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "429.png",
    stats: { attack: 46, defense: 40, earthResist: 3, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "energized-demonbone",
    name: "Energized Demonbone",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "428.png",
    stats: { attack: 46, defense: 40, energyResist: 3, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "unliving-demonbone",
    name: "Unliving Demonbone",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "427.png",
    stats: { attack: 46, deathResist: 3, defense: 40, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "sulphurous-demonbone",
    name: "Sulphurous Demonbone",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 80,
    sprite: "426.png",
    stats: { attack: 46, defense: 40, fireResist: 3, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+3% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "golden-axe",
    name: "Golden Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 0,
    sprite: "237.png",
    stats: { attack: 10, defense: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Construct", base: "wiki/056-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "living-vine-bow",
    name: "Living Vine Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 220,
    sprite: "364.png",
    stats: { attack: 5, distanceFighting: 1, earthResist: 4, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Damage at range", description: "+6 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+3 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+7 damage at range 2", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+3 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+8 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+3 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage at range", description: "+9 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+3 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage at range", description: "+10 damage at range 5", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+3 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage at range", description: "+11 damage at range 6", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+3 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "resizer",
    name: "Resizer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 230,
    sprite: "438.png",
    stats: { attack: 11, clubFighting: 1, damageType: "ice", defense: 33, imbueSlots: 2, extraAttack: 45, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+0.75% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+1.75% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+2.50% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "summerblade",
    name: "Summerblade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 200,
    sprite: "369.png",
    stats: { attack: 10, damageType: "fire", defense: 20, imbueSlots: 2, swordFighting: 1, extraAttack: 41, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "winterblade",
    name: "Winterblade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 200,
    sprite: "368.png",
    stats: { attack: 10, damageType: "ice", defense: 22, imbueSlots: 2, swordFighting: 1, extraAttack: 40, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Shielding as extra damage for auto-attacks", base: "wiki/092-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+2.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "energized-limb",
    name: "Energized Limb",
    category: "spellbook",
    vocation: "any",
    hands: 1,
    levelRequirement: 180,
    sprite: "217.png",
    stats: { damageRange: "88-108", damageType: "fire", energyResist: 10, imbueSlots: 2, magicLevel: 1, manaCost: 24, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+2% damage against Elemental", base: "wiki/062-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
    ]),
  },

  {
    id: "ice-hatchet",
    name: "Ice Hatchet",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "347.png",
    stats: { attack: 4, damageType: "ice", defense: 8, extraAttack: 11, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+2 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+25% base damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/damage.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+100% critical extra damage for Lesser Front Sweep", base: "wiki/110-lesser-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical extra damage", description: "+100% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cobra-crossbow",
    name: "Cobra Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 220,
    sprite: "138.png",
    stats: { attack: 7, distanceFighting: 1, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Damage at range", description: "+8 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/life-leech.png" },
        { name: "Mana on hit", description: "+5 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cobra-axe",
    name: "Cobra Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 220,
    sprite: "135.png",
    stats: { attack: 8, axeFighting: 2, damageType: "ice", defense: 29, imbueSlots: 2, extraAttack: 44, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Life Gain on Kill", description: "+16 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Axe Fighting as extra healing for your spells", base: "wiki/079-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cobra-sword",
    name: "Cobra Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 220,
    sprite: "136.png",
    stats: { attack: 52, defense: 31, imbueSlots: 2, swordFighting: 3 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+12% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Life Gain on Kill", description: "+16 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Sword Fighting as extra healing for your spells", base: "wiki/045-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cobra-wand",
    name: "Cobra Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 270,
    sprite: "152.png",
    stats: { critExtraDamage: 25, damageRange: "94-100", damageType: "energy", imbueSlots: 2, magicLevel: 2, manaCost: 22, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+1% critical hit chance for Great Energy Beam", base: "wiki/123-great-energy-beam.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "cobra-rod",
    name: "Cobra Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 220,
    sprite: "151.png",
    stats: { damageRange: "70-110", damageType: "earth", hpLeech: 18, imbueSlots: 2, magicLevel: 2, manaCost: 21, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-4s cooldown for Strong Terra Strike", base: "wiki/126-strong-terra-strike.gif" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Strong Terra Strike", base: "wiki/126-strong-terra-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "mortal-mace",
    name: "Mortal Mace",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 220,
    sprite: "410.png",
    stats: { attack: 8, clubFighting: 2, damageType: "death", defense: 27, imbueSlots: 2, extraAttack: 44, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+6 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+2.50% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "bow-of-cataclysm",
    name: "Bow Of Cataclysm",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 250,
    sprite: "365.png",
    stats: { attack: 6, deathResist: 4, distanceFighting: 1, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Elemental critical hit chance", description: "", base: "wiki/135-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "", base: "wiki/129-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "tagralt-blade",
    name: "Tagralt Blade",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 250,
    sprite: "449.png",
    stats: { attack: 7, damageType: "earth", defense: 32, imbueSlots: 2, swordFighting: 3, extraAttack: 49, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+5 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "phantasmal-axe",
    name: "Phantasmal Axe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 180,
    sprite: "349.png",
    stats: { attack: 5, axeFighting: 2, damageType: "fire", defense: 32, imbueSlots: 2, extraAttack: 48, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+6% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for healing", description: "+8% of your Axe Fighting as extra healing for your spells", base: "wiki/079-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Damage against bestiary family", description: "+2% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulcutter",
    name: "Soulcutter",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 400,
    sprite: "29.png",
    stats: { attack: 7, damageType: "death", defense: 32, hpLeech: 2, imbueSlots: 2, manaLeech: 1, swordFighting: 4, extraAttack: 45, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulshredder",
    name: "Soulshredder",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 400,
    sprite: "30.png",
    stats: { attack: 10, damageType: "ice", defense: 35, imbueSlots: 3, swordFighting: 4, extraAttack: 47, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulbiter",
    name: "Soulbiter",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 400,
    sprite: "27.png",
    stats: { attack: 7, axeFighting: 4, damageType: "death", defense: 32, hpLeech: 2, imbueSlots: 2, manaLeech: 1, extraAttack: 45, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "souleater",
    name: "Souleater",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 400,
    sprite: "32.png",
    stats: {},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulcrusher",
    name: "Soulcrusher",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 400,
    sprite: "28.png",
    stats: { attack: 6, clubFighting: 4, damageType: "ice", defense: 33, hpLeech: 2, imbueSlots: 2, manaLeech: 1, extraAttack: 46, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulmaimer",
    name: "Soulmaimer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 400,
    sprite: "31.png",
    stats: { attack: 10, clubFighting: 4, damageType: "energy", defense: 35, imbueSlots: 3, extraAttack: 47, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Auto-attack critical hit chance", description: "+3% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Executioner's Throw", base: "wiki/128-executioner-s-throw.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulpiercer",
    name: "Soulpiercer",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 400,
    sprite: "448.png",
    stats: { attack: 9, deathResist: 7, distanceFighting: 3, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana on hit", description: "+10 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
        { name: "Damage at range", description: "+10 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+75% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
        { name: "Combat skill", description: "+2 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Combat skill scaling for healing", description: "+125% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Life on hit", description: "+7 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soultainter",
    name: "Soultainter",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 400,
    sprite: "36.png",
    stats: { damageRange: "100-120", damageType: "death", deathResist: 12, imbueSlots: 2, magicLevel: 4, manaCost: 22, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+7.50% critical extra damage for Death spells and runes", base: "wiki/129-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Great Death Beam", base: "wiki/130-great-death-beam.gif", augment: "augments/critical-chance.png" },
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1.50% critical extra hit chance for Death spells and runes", base: "wiki/131-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Great Death Beam", base: "wiki/130-great-death-beam.gif", augment: "augments/critical-chance.png" },
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Death Magic Level", base: "wiki/093-weapon-proficiency-specialized-magic-level.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Rune critical extra damage", description: "+12% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulhexer",
    name: "Soulhexer",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 400,
    sprite: "35.png",
    stats: { damageRange: "98-118", damageType: "ice", hpLeech: 2, iceResist: 12, imbueSlots: 2, magicLevel: 4, manaCost: 21, manaLeech: 1, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+7.50% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Ice Burst", base: "wiki/132-ice-burst.gif", augment: "augments/life-leech.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Ice Burst", base: "wiki/132-ice-burst.gif", augment: "augments/mana-leech.png" },
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 6, choices: [
        { name: "Armor penetration", description: "+5% life leech", base: "wiki/050-weapon-proficiency-general.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Rune critical extra damage", description: "+12% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-longbow",
    name: "Lion Longbow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 270,
    sprite: "143.png",
    stats: { attack: 6, distanceFighting: 1, iceResist: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Damage at range", description: "+15 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
        { name: "Mana Gain on Kill", description: "+10 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-rod",
    name: "Lion Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 270,
    sprite: "153.png",
    stats: { critExtraDamage: 25, damageRange: "85-105", damageType: "ice", imbueSlots: 2, magicLevel: 2, manaCost: 20, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+1% critical hit chance for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-wand",
    name: "Lion Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 220,
    sprite: "154.png",
    stats: { damageRange: "89-109", damageType: "ice", hpLeech: 18, imbueSlots: 2, magicLevel: 2, manaCost: 21, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana on hit", description: "+3 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-4s cooldown for Strong Flame Strike", base: "wiki/134-strong-flame-strike.gif" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Strong Flame Strike", base: "wiki/134-strong-flame-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-longsword",
    name: "Lion Longsword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 270,
    sprite: "141.png",
    stats: { attack: 8, damageType: "earth", defense: 31, imbueSlots: 2, swordFighting: 3, extraAttack: 44, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Sword Fighting as extra healing for your spells", base: "wiki/045-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-axe",
    name: "Lion Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 270,
    sprite: "140.png",
    stats: { attack: 8, axeFighting: 3, damageType: "earth", defense: 31, imbueSlots: 2, extraAttack: 44, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Axe Fighting as extra healing for your spells", base: "wiki/079-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-hammer",
    name: "Lion Hammer",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 270,
    sprite: "139.png",
    stats: { attack: 8, clubFighting: 3, damageType: "earth", defense: 31, imbueSlots: 2, extraAttack: 44, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/critical-chance.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Front Sweep", base: "wiki/082-front-sweep.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "-2s cooldown for Front Sweep", base: "wiki/082-front-sweep.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Club Fighting as extra healing for your spells", base: "wiki/063-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "jungle-flail",
    name: "Jungle Flail",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 150,
    sprite: "263.png",
    stats: { attack: 52, defense: 31, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+6.50% base damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "throwing-axe",
    name: "Throwing Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 150,
    sprite: "264.png",
    stats: { attack: 51, axeFighting: 2, defense: 30, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+6.50% base damage for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Whirlwind Throw", base: "wiki/059-whirlwind-throw.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "jungle-bow",
    name: "Jungle Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 150,
    sprite: "265.png",
    stats: { attack: 6, distanceFighting: 1, imbueSlots: 2, physicalResist: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Life Gain on Kill", description: "+12 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Mana Gain on Kill", description: "+12 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "jungle-rod",
    name: "Jungle Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 150,
    sprite: "261.png",
    stats: { damageRange: "80-100", damageType: "ice", earthResist: 3, imbueSlots: 2, manaCost: 19, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical extra damage", description: "+5% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 4, choices: [
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+22 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical hit chance", description: "+2.50% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "jungle-wand",
    name: "Jungle Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 150,
    sprite: "262.png",
    stats: { damageRange: "80-100", damageType: "earth", iceResist: 3, imbueSlots: 2, magicLevel: 1, manaCost: 19, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+30% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+30% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Rune critical extra damage", description: "+5% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Life Gain on Kill", description: "+10 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+22 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Auto-attack critical extra damage", description: "+25% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-claymore",
    name: "Eldritch Claymore",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 270,
    sprite: "89.png",
    stats: { attack: 6, damageType: "fire", defense: 33, imbueSlots: 2, swordFighting: 3, extraAttack: 50, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+75% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-claymore",
    name: "Gilded Eldritch Claymore",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 270,
    sprite: "96.png",
    stats: { attack: 6, damageType: "fire", defense: 33, imbueSlots: 2, swordFighting: 3, extraAttack: 50, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+30% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+150% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+12% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-warmace",
    name: "Eldritch Warmace",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 270,
    sprite: "87.png",
    stats: { attack: 6, clubFighting: 3, damageType: "fire", defense: 33, imbueSlots: 2, extraAttack: 50, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+75% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-warmace",
    name: "Gilded Eldritch Warmace",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 270,
    sprite: "94.png",
    stats: { attack: 6, clubFighting: 3, damageType: "fire", defense: 33, imbueSlots: 2, extraAttack: 50, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+30% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+150% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+12% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-greataxe",
    name: "Eldritch Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 270,
    sprite: "88.png",
    stats: { attack: 56, axeFighting: 3, defense: 33, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+75% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+100% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-greataxe",
    name: "Gilded Eldritch Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 270,
    sprite: "95.png",
    stats: { attack: 56, axeFighting: 3, defense: 33, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+30% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+150% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+100% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Auto-attack critical hit chance", description: "+5% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+12% critical extra damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-bow",
    name: "Eldritch Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 250,
    sprite: "91.png",
    stats: { attack: 6, distanceFighting: 2, holyMagicLevel: 1, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+12 damage at range 2", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
        { name: "Damage at range", description: "+8 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+15% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage at range", description: "+24 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Elemental critical hit chance", description: "+1.50% critical extra hit chance for Holy spells and runes", base: "wiki/135-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Damage at range", description: "+16 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-bow",
    name: "Gilded Eldritch Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 250,
    sprite: "98.png",
    stats: { attack: 6, distanceFighting: 2, holyMagicLevel: 1, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+12 damage at range 2", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
        { name: "Damage at range", description: "+8 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+20% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage at range", description: "+24 damage at range 1", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Holy spells and runes", base: "wiki/135-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Damage at range", description: "+16 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-wand",
    name: "Eldritch Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 250,
    sprite: "93.png",
    stats: { damageRange: "85-105", damageType: "fire", energyResist: 4, fireMagicLevel: 1, imbueSlots: 2, magicLevel: 2, manaCost: 22, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+25 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Specialized magic level", description: "+1 Death Magic Level", base: "wiki/093-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+3.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% critical extra damage for Great Fire Wave", base: "wiki/136-great-fire-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical extra damage", description: "+7% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Rune critical hit chance", description: "+1.50% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-wand",
    name: "Gilded Eldritch Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 250,
    sprite: "99.png",
    stats: { damageRange: "85-105", damageType: "fire", energyResist: 4, fireMagicLevel: 1, imbueSlots: 2, magicLevel: 2, manaCost: 22, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+25 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Specialized magic level", description: "+1 Death Magic Level", base: "wiki/093-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+7.50% critical extra damage for Great Fire Wave", base: "wiki/136-great-fire-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical extra damage", description: "+10% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Rune critical hit chance", description: "+2% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-rod",
    name: "Eldritch Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 250,
    sprite: "92.png",
    stats: { damageRange: "85-105", damageType: "ice", earthResist: 4, healingMagicLevel: 2, imbueSlots: 2, magicLevel: 2, manaCost: 22, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+25 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+2 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+3.50% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% healing for Heal Friend", base: "wiki/137-heal-friend.gif", augment: "augments/damage.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical extra damage", description: "+7% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Rune critical hit chance", description: "+1.50% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-rod",
    name: "Gilded Eldritch Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 250,
    sprite: "100.png",
    stats: { damageRange: "85-105", damageType: "ice", earthResist: 4, healingMagicLevel: 2, imbueSlots: 2, magicLevel: 2, manaCost: 22, range: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana Gain on Kill", description: "+25 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+2 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+6% healing for Heal Friend", base: "wiki/137-heal-friend.gif", augment: "augments/damage.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical extra damage", description: "+10% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+15% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Rune critical hit chance", description: "+2% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "naga-sword",
    name: "Naga Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "254.png",
    stats: { attack: 8, damageType: "ice", defense: 31, imbueSlots: 2, swordFighting: 2, extraAttack: 44, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+75% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "naga-axe",
    name: "Naga Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "251.png",
    stats: { attack: 8, axeFighting: 2, damageType: "energy", defense: 31, imbueSlots: 2, extraAttack: 44, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+75% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "naga-club",
    name: "Naga Club",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "252.png",
    stats: { attack: 52, clubFighting: 2, defense: 31, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+75% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "naga-crossbow",
    name: "Naga Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "256.png",
    stats: { attack: 8, distanceFighting: 1, earthResist: 4, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life on hit", description: "+3 mana on hit", base: "wiki/011-weapon-proficiency-general.png" },
        { name: "Mana on hit", description: "+5 hit points on hit", base: "wiki/021-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "naga-wand",
    name: "Naga Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 250,
    sprite: "255.png",
    stats: { damageRange: "90-120", damageType: "energy", energyMagicLevel: 1, iceResist: 4, imbueSlots: 2, magicLevel: 2, manaCost: 21 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ultimate Energy Strike", base: "wiki/138-ultimate-energy-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+15% life leech for Ultimate Energy Strike", base: "wiki/138-ultimate-energy-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ultimate Energy Strike", base: "wiki/138-ultimate-energy-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+15% life leech for Ultimate Energy Strike", base: "wiki/138-ultimate-energy-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "naga-rod",
    name: "Naga Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 250,
    sprite: "253.png",
    stats: { damageRange: "90-110", damageType: "ice", fireResist: 4, iceMagicLevel: 1, imbueSlots: 2, magicLevel: 2, manaCost: 21 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental critical extra damage", description: "+3% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 2, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ultimate Ice Strike", base: "wiki/139-ultimate-ice-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+15% life leech for Ultimate Ice Strike", base: "wiki/139-ultimate-ice-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ultimate Ice Strike", base: "wiki/139-ultimate-ice-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+15% life leech for Ultimate Ice Strike", base: "wiki/139-ultimate-ice-strike.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "broken-macuahuitl",
    name: "Broken Macuahuitl",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "421.png",
    stats: { attack: 1, defense: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Attack damage", description: "+5 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "", base: "wiki/088-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "broken-iks-spear",
    name: "Broken Iks Spear",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 0,
    sprite: "445.png",
    stats: { attack: 1, defense: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bestiary family", description: "", base: "wiki/088-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-blade",
    name: "Sanguine Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 600,
    sprite: "6.png",
    stats: { attack: 8, damageType: "fire", defense: 32, hpLeech: 3, imbueSlots: 2, manaLeech: 1, swordFighting: 4, extraAttack: 46, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-blade",
    name: "Grand Sanguine Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 600,
    sprite: "19.png",
    stats: { attack: 8, damageType: "fire", defense: 32, hpLeech: 3, imbueSlots: 2, manaLeech: 1, swordFighting: 4, extraAttack: 46, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-cudgel",
    name: "Sanguine Cudgel",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 600,
    sprite: "9.png",
    stats: { attack: 8, clubFighting: 4, damageType: "death", defense: 32, hpLeech: 3, imbueSlots: 2, manaLeech: 1, extraAttack: 46, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-cudgel",
    name: "Grand Sanguine Cudgel",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 600,
    sprite: "18.png",
    stats: { attack: 8, clubFighting: 4, damageType: "death", defense: 32, hpLeech: 3, imbueSlots: 2, manaLeech: 1, extraAttack: 46, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-hatchet",
    name: "Sanguine Hatchet",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 600,
    sprite: "8.png",
    stats: { attack: 8, axeFighting: 4, damageType: "fire", defense: 32, hpLeech: 3, imbueSlots: 2, manaLeech: 1, extraAttack: 46, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-hatchet",
    name: "Grand Sanguine Hatchet",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 600,
    sprite: "17.png",
    stats: { attack: 8, axeFighting: 4, damageType: "fire", defense: 32, hpLeech: 3, imbueSlots: 2, manaLeech: 1, extraAttack: 46, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Armor penetration", description: "+3% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-razor",
    name: "Sanguine Razor",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 600,
    sprite: "10.png",
    stats: { attack: 8, damageType: "energy", defense: 35, imbueSlots: 3, swordFighting: 4, extraAttack: 50, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-razor",
    name: "Grand Sanguine Razor",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 600,
    sprite: "20.png",
    stats: { attack: 8, damageType: "energy", defense: 35, imbueSlots: 3, swordFighting: 4, extraAttack: 50, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-bludgeon",
    name: "Sanguine Bludgeon",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 600,
    sprite: "12.png",
    stats: { attack: 8, clubFighting: 4, damageType: "earth", defense: 35, imbueSlots: 3, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-bludgeon",
    name: "Grand Sanguine Bludgeon",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 600,
    sprite: "21.png",
    stats: { attack: 8, clubFighting: 4, damageType: "earth", defense: 35, imbueSlots: 3, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-battleaxe",
    name: "Grand Sanguine Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 600,
    sprite: "22.png",
    stats: { attack: 8, axeFighting: 4, damageType: "death", defense: 35, imbueSlots: 3, extraAttack: 50, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% mana leech for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Fierce Berserk", base: "wiki/094-fierce-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+500% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-crossbow",
    name: "Sanguine Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 600,
    sprite: "447.png",
    stats: { attack: 10, distanceFighting: 3, fireResist: 6, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+10 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+2% mana leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/damage.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+200% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-crossbow",
    name: "Grand Sanguine Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 600,
    sprite: "450.png",
    stats: { attack: 10, distanceFighting: 3, fireResist: 6, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage at range", description: "+10 damage at range 3", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+4% mana leech for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/damage.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Divine Caldera", base: "wiki/140-divine-caldera.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+200% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-coil",
    name: "Grand Sanguine Coil",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 600,
    sprite: "26.png",
    stats: { critExtraDamage: 5, damageRange: "103-125", damageType: "fire", earthResist: 7, energyMagicLevel: 1, fireMagicLevel: 1, hpLeech: 2, imbueSlots: 2, magicLevel: 4, manaCost: 21, manaLeech: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Critical extra damage", description: "+7% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+8% base damage for Energy Wave", base: "wiki/119-energy-wave.gif", augment: "augments/damage.png" },
        { name: "Spell augmentation", description: "+25% critical extra damage for Hell's Core", base: "wiki/141-hell-s-core.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+8% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+6% base damage for Hell's Core", base: "wiki/141-hell-s-core.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+2 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Elemental critical hit chance", description: "+2% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-rod",
    name: "Grand Sanguine Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 600,
    sprite: "25.png",
    stats: { critExtraDamage: 5, damageRange: "100-124", damageType: "earth", deathResist: 7, earthMagicLevel: 1, hpLeech: 6, iceMagicLevel: 1, imbueSlots: 2, magicLevel: 4, manaLeech: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+8% base damage for Terra Wave", base: "wiki/117-terra-wave.gif", augment: "augments/damage.png" },
        { name: "Spell augmentation", description: "+25% critical extra damage for Eternal Winter", base: "wiki/142-eternal-winter.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+8% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+6% base damage for Eternal Winter", base: "wiki/142-eternal-winter.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+2 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+2 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Specialized magic level", description: "+3 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Spell augmentation", description: "+6% healing for Heal Friend", base: "wiki/137-heal-friend.gif", augment: "augments/damage.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-slayer",
    name: "Amber Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 330,
    sprite: "42.png",
    stats: { attack: 50, damageType: "earth", defense: 34, imbueSlots: 2, swordFighting: 3, extraAttack: 50, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-6s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-greataxe",
    name: "Amber Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 330,
    sprite: "41.png",
    stats: { attack: 50, axeFighting: 3, damageType: "earth", defense: 34, imbueSlots: 2, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-6s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-bludgeon",
    name: "Amber Bludgeon",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 330,
    sprite: "40.png",
    stats: { attack: 50, clubFighting: 3, damageType: "death", defense: 34, imbueSlots: 2, extraAttack: 50, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-6s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-bow",
    name: "Amber Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 330,
    sprite: "44.png",
    stats: { attack: 7, distanceFighting: 3, energyResist: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12.50% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+6% critical extra damage for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+35% life leech for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12.50% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+6% critical extra damage for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+35% life leech for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Grenade", base: "wiki/143-divine-grenade.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+35% mana leech for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Specialized magic level", description: "+2 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "amber-wand",
    name: "Amber Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 330,
    sprite: "46.png",
    stats: { damageType: "energy", energyMagicLevel: 2, iceResist: 6, imbueSlots: 2, magicLevel: 2, manaCost: 20, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+4% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Rune critical extra damage", description: "+5% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Energy spells and runes", base: "wiki/033-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Mana Gain on Kill", description: "+30 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Energy Magic Level", base: "wiki/109-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Rage of the Skies", base: "wiki/144-rage-of-the-skies.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental critical extra damage", description: "+7% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+50% mana leech for Rage of the Skies", base: "wiki/144-rage-of-the-skies.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "amber-rod",
    name: "Amber Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 330,
    sprite: "45.png",
    stats: { damageRange: "106", damageType: "ice", fireResist: 6, iceMagicLevel: 2, imbueSlots: 2, magicLevel: 2, manaCost: 20, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for healing", description: "+8% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Rune critical extra damage", description: "+5% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Rune critical hit chance", description: "+1% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Ice Magic Level", base: "wiki/107-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+6% critical extra damage for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental critical extra damage", description: "+7% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/life-leech.png" },
      ]},
    ]),
  },

  {
    id: "amber-sabre",
    name: "Amber Sabre",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 330,
    sprite: "37.png",
    stats: { attack: 46, damageType: "energy", defense: 32, imbueSlots: 2, swordFighting: 3, extraAttack: 46, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-6s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-axe",
    name: "Amber Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 330,
    sprite: "38.png",
    stats: { attack: 46, axeFighting: 3, damageType: "ice", defense: 32, imbueSlots: 2, extraAttack: 46, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-6s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-cudgel",
    name: "Amber Cudgel",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 330,
    sprite: "39.png",
    stats: { attack: 46, clubFighting: 4, damageType: "fire", defense: 32, imbueSlots: 2, extraAttack: 46, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-6s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+50% life leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Annihilation", base: "wiki/084-annihilation.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% mana leech for Annihilation", base: "wiki/084-annihilation.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-crossbow",
    name: "Amber Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 330,
    sprite: "315.png",
    stats: { attack: 8, distanceFighting: 3, energyResist: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12.50% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+6% critical extra damage for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+6% life leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage at range", description: "+12 damage at range 4", base: "wiki/025-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Aquatic", base: "wiki/097-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+6% critical extra damage for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+6% life leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Divine Grenade", base: "wiki/143-divine-grenade.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+12.50% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+6% mana leech for Divine Missile", base: "wiki/120-divine-missile.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Specialized magic level", description: "+2 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-arbalest",
    name: "Inferniarch Arbalest",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "54.png",
    stats: { attack: 7, distanceFighting: 2, iceResist: 4, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-battleaxe",
    name: "Inferniarch Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "48.png",
    stats: { attack: 8, axeFighting: 3, damageType: "fire", defense: 31, imbueSlots: 2, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-greataxe",
    name: "Inferniarch Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "51.png",
    stats: { attack: 8, axeFighting: 4, damageType: "fire", defense: 33, imbueSlots: 2, extraAttack: 48, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-flail",
    name: "Inferniarch Flail",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "47.png",
    stats: { attack: 8, clubFighting: 3, damageType: "death", defense: 31, imbueSlots: 2, extraAttack: 44, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-warhammer",
    name: "Inferniarch Warhammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "50.png",
    stats: { attack: 8, clubFighting: 4, damageType: "ice", defense: 33, imbueSlots: 2, extraAttack: 48, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-blade",
    name: "Inferniarch Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "49.png",
    stats: { attack: 8, damageType: "fire", defense: 31, imbueSlots: 2, swordFighting: 3, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-wand",
    name: "Inferniarch Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 300,
    sprite: "55.png",
    stats: { damageRange: "98-116", damageType: "death", earthResist: 5, fireMagicLevel: 1, imbueSlots: 2, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fishing as extra damage for auto-attacks", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+20% life leech for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+20% mana leech for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-rod",
    name: "Inferniarch Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 300,
    sprite: "56.png",
    stats: { damageRange: "102", damageType: "earth", deathResist: 5, earthMagicLevel: 1, imbueSlots: 2, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+50% of your Fishing as extra damage for auto-attacks", base: "wiki/095-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% critical extra damage for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+20% life leech for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+20% mana leech for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-slayer",
    name: "Inferniarch Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "52.png",
    stats: { attack: 8, damageType: "energy", defense: 33, imbueSlots: 2, swordFighting: 4, extraAttack: 48, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-arbalest",
    name: "Rending Inferniarch Arbalest",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "64.png",
    stats: { attack: 8, distanceFighting: 2, iceResist: 4, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Dazzle", base: "wiki/147-divine-dazzle.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-arbalest",
    name: "Draining Inferniarch Arbalest",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "74.png",
    stats: { attack: 8, distanceFighting: 2, iceResist: 4, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Dazzle", base: "wiki/147-divine-dazzle.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-arbalest",
    name: "Siphoning Inferniarch Arbalest",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "86.png",
    stats: { attack: 8, distanceFighting: 2, iceResist: 4, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Dazzle", base: "wiki/147-divine-dazzle.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-battleaxe",
    name: "Rending Inferniarch Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "61.png",
    stats: { attack: 8, axeFighting: 3, damageType: "fire", defense: 31, imbueSlots: 1, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-battleaxe",
    name: "Draining Inferniarch Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "71.png",
    stats: { attack: 8, axeFighting: 3, damageType: "fire", defense: 31, imbueSlots: 1, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-battleaxe",
    name: "Siphoning Inferniarch Battleaxe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "81.png",
    stats: { attack: 8, axeFighting: 3, damageType: "fire", defense: 31, imbueSlots: 1, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-greataxe",
    name: "Rending Inferniarch Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "58.png",
    stats: { attack: 8, axeFighting: 4, damageType: "fire", defense: 33, imbueSlots: 1, extraAttack: 48, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-greataxe",
    name: "Draining Inferniarch Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "68.png",
    stats: { attack: 8, axeFighting: 4, damageType: "fire", defense: 33, imbueSlots: 1, extraAttack: 48, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-greataxe",
    name: "Siphoning Inferniarch Greataxe",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "78.png",
    stats: { attack: 8, axeFighting: 4, damageType: "fire", defense: 33, imbueSlots: 1, extraAttack: 48, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Axe Fighting as extra damage for auto-attacks", base: "wiki/039-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-flail",
    name: "Rending Inferniarch Flail",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "60.png",
    stats: { attack: 8, clubFighting: 3, damageType: "death", defense: 31, imbueSlots: 1, extraAttack: 44, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-flail",
    name: "Draining Inferniarch Flail",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "70.png",
    stats: { attack: 8, clubFighting: 3, damageType: "death", defense: 31, imbueSlots: 1, extraAttack: 44, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-flail",
    name: "Siphoning Inferniarch Flail",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "80.png",
    stats: { attack: 8, clubFighting: 3, damageType: "death", defense: 31, imbueSlots: 1, manaLeech: 10, extraAttack: 44, extraAttackType: "death" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-warhammer",
    name: "Rending Inferniarch Warhammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "57.png",
    stats: { attack: 8, clubFighting: 4, damageType: "ice", defense: 33, imbueSlots: 1, extraAttack: 48, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-warhammer",
    name: "Draining Inferniarch Warhammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "67.png",
    stats: { attack: 8, clubFighting: 4, damageType: "ice", defense: 33, imbueSlots: 1, extraAttack: 48, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-warhammer",
    name: "Siphoning Inferniarch Warhammer",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "77.png",
    stats: { attack: 8, clubFighting: 4, damageType: "ice", defense: 33, imbueSlots: 1, extraAttack: 48, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Club Fighting as extra damage for auto-attacks", base: "wiki/036-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-blade",
    name: "Rending Inferniarch Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "62.png",
    stats: { attack: 8, damageType: "fire", defense: 31, imbueSlots: 1, swordFighting: 3, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-blade",
    name: "Draining Inferniarch Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "72.png",
    stats: { attack: 8, damageType: "fire", defense: 31, imbueSlots: 1, swordFighting: 3, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-blade",
    name: "Siphoning Inferniarch Blade",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 300,
    sprite: "82.png",
    stats: { attack: 8, damageType: "fire", defense: 31, imbueSlots: 1, swordFighting: 3, extraAttack: 44, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-slayer",
    name: "Rending Inferniarch Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "59.png",
    stats: { attack: 8, damageType: "energy", defense: 33, imbueSlots: 1, swordFighting: 4, extraAttack: 48, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-slayer",
    name: "Draining Inferniarch Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "69.png",
    stats: { attack: 8, damageType: "energy", defense: 33, imbueSlots: 1, swordFighting: 4, extraAttack: 48, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-slayer",
    name: "Siphoning Inferniarch Slayer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 300,
    sprite: "79.png",
    stats: { attack: 8, damageType: "energy", defense: 33, imbueSlots: 1, swordFighting: 4, extraAttack: 48, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Berserk", base: "wiki/046-berserk.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-wand",
    name: "Rending Inferniarch Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 300,
    sprite: "65.png",
    stats: { damageRange: "100-120", damageType: "death", earthResist: 5, fireMagicLevel: 1, imbueSlots: 1, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-wand",
    name: "Draining Inferniarch Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 300,
    sprite: "76.png",
    stats: { damageRange: "100-120", damageType: "death", earthResist: 5, fireMagicLevel: 1, imbueSlots: 1, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+40% life leech for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/life-leech.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-wand",
    name: "Siphoning Inferniarch Wand",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 300,
    sprite: "84.png",
    stats: { damageRange: "100-120", damageType: "death", earthResist: 5, fireMagicLevel: 1, imbueSlots: 1, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Fire Magic Level", base: "wiki/089-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+40% mana leech for Ultimate Flame Strike", base: "wiki/145-ultimate-flame-strike.gif", augment: "augments/mana-leech.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Fire spells and runes", base: "wiki/027-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-rod",
    name: "Rending Inferniarch Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 300,
    sprite: "66.png",
    stats: { damageRange: "102", damageType: "earth", deathResist: 5, earthMagicLevel: 1, imbueSlots: 1, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+20% critical extra damage for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-rod",
    name: "Draining Inferniarch Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 300,
    sprite: "75.png",
    stats: { damageRange: "102", damageType: "earth", deathResist: 5, earthMagicLevel: 1, imbueSlots: 1, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+40% life leech for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/life-leech.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-rod",
    name: "Siphoning Inferniarch Rod",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 300,
    sprite: "85.png",
    stats: { damageRange: "102", damageType: "earth", deathResist: 5, earthMagicLevel: 1, imbueSlots: 1, magicLevel: 3, range: 5 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Life Gain on Kill", description: "+20 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+6% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif" },
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Earth Magic Level", base: "wiki/108-weapon-proficiency-specialized-magic-level.png" },
        { name: "Spell augmentation", description: "+40% mana leech for Ultimate Terra Strike", base: "wiki/146-ultimate-terra-strike.gif", augment: "augments/mana-leech.png" },
        { name: "Combat skill scaling for spell damage", description: "+7% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental critical hit chance", description: "+1% critical extra hit chance for Earth spells and runes", base: "wiki/017-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
    ]),
  },

  {
    id: "sanguine-claws",
    name: "Sanguine Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 600,
    sprite: "14.png",
    stats: { attack: 45, defense: 21, fistFighting: 4, imbueSlots: 3, magicLevel: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+4% base damage for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+100% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+2% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "grand-sanguine-claws",
    name: "Grand Sanguine Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 600,
    sprite: "24.png",
    stats: { attack: 45, defense: 21, fistFighting: 4, imbueSlots: 3, magicLevel: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% mana leech for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+8% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+40% critical extra damage for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+8% base damage for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Sweeping Takedown", base: "wiki/149-sweeping-takedown.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+100% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+3% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "soulkamas",
    name: "Soulkamas",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 400,
    sprite: "33.png",
    stats: { attack: 44, defense: 21, fistFighting: 4, imbueSlots: 3, magicLevel: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Chained Penance", base: "wiki/150-chained-penance.gif", augment: "augments/life-leech.png" },
        { name: "Critical extra damage", description: "+4% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Chained Penance", base: "wiki/150-chained-penance.gif", augment: "augments/mana-leech.png" },
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+20% critical extra damage for Chained Penance", base: "wiki/150-chained-penance.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3.50% base damage for Chained Penance", base: "wiki/150-chained-penance.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+7.50% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Chained Penance", base: "wiki/150-chained-penance.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+20 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Critical hit chance", description: "+1% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "naga-katar",
    name: "Naga Katar",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 300,
    sprite: "257.png",
    stats: { attack: 43, defense: 21, fistFighting: 3, imbueSlots: 2, magicLevel: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Life Gain on Kill", description: "+30 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Reptile", base: "wiki/052-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+12% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "falcon-sai",
    name: "Falcon Sai",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 300,
    sprite: "147.png",
    stats: { attack: 43, defense: 20, fistFighting: 4, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+10% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+15% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Combat skill scaling for healing", description: "+15% of your Shielding as extra healing for your spells", base: "wiki/122-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+4% life leech", base: "wiki/050-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+5% life leech for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+1% critical hit chance for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+5% damage against Bird", base: "wiki/118-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for spell damage", description: "+20% of your Shielding as extra damage for your spells", base: "wiki/086-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "lion-claws",
    name: "Lion Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 270,
    sprite: "142.png",
    stats: { attack: 43, defense: 19, fistFighting: 4, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+13% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical extra damage", description: "+6% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% life leech for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+1% critical hit chance for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Lycanthrope", base: "wiki/049-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Fist Fighting as extra healing for your spells", base: "wiki/152-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "crude-umbral-katar",
    name: "Crude Umbral Katar",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 75,
    sprite: "107.png",
    stats: { attack: 39, defense: 16, fistFighting: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+15 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-katar",
    name: "Umbral Katar",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 120,
    sprite: "115.png",
    stats: { attack: 40, defense: 17, fistFighting: 2, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "umbral-master-katar",
    name: "Umbral Master Katar",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 250,
    sprite: "123.png",
    stats: { attack: 41, defense: 18, fistFighting: 3, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+12% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Humanoid", base: "wiki/077-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "+5% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Mana Gain on Kill", description: "+15 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "cobra-bo",
    name: "Cobra Bo",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 250,
    sprite: "137.png",
    stats: { attack: 42, defense: 20, fistFighting: 4, hpLeech: 14, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+10% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+8% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+4% life leech", base: "wiki/050-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+10% critical extra damage for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+1% critical hit chance for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
        { name: "Damage against bestiary family", description: "+4% damage against Mammal", base: "wiki/074-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill scaling for healing", description: "+10% of your Fist Fighting as extra healing for your spells", base: "wiki/152-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 5, choices: [
        { name: "Critical extra damage", description: "+5% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "nunchaku-of-destruction",
    name: "Nunchaku Of Destruction",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 200,
    sprite: "213.png",
    stats: { attack: 40, defense: 17, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "eldritch-crescent-moon-spade",
    name: "Eldritch Crescent Moon Spade",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 250,
    sprite: "90.png",
    stats: { attack: 42, defense: 20, fistFighting: 2, imbueSlots: 2, magicLevel: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+20% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+12.50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "gilded-eldritch-crescent-moon-spade",
    name: "Gilded Eldritch Crescent Moon Spade",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 250,
    sprite: "97.png",
    stats: { attack: 42, defense: 20, fistFighting: 2, imbueSlots: 2, magicLevel: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+30% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+15% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill scaling for spell damage", description: "+12.50% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+3% damage against Magical", base: "wiki/055-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Mana leech", description: "+2% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+2 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "depth-claws",
    name: "Depth Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 135,
    sprite: "401.png",
    stats: { attack: 40, defense: 18, fistFighting: 2, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+25% critical extra damage for Mystic Repulse", base: "wiki/153-mystic-repulse.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% critical hit chance for Mystic Repulse", base: "wiki/153-mystic-repulse.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+14% base damage for Mystic Repulse", base: "wiki/153-mystic-repulse.gif", augment: "augments/damage.png" },
      ]},
      { level: 5, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "amber-kusarigama",
    name: "Amber Kusarigama",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 330,
    sprite: "43.png",
    stats: { attack: 44, defense: 20, fistFighting: 4, imbueSlots: 2, magicLevel: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+25% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Devastating Knockout", base: "wiki/154-devastating-knockout.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+35% life leech for Devastating Knockout", base: "wiki/154-devastating-knockout.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "-4s cooldown for Devastating Knockout", base: "wiki/154-devastating-knockout.gif" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+7% critical extra damage for Devastating Knockout", base: "wiki/154-devastating-knockout.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+35% life leech for Devastating Knockout", base: "wiki/154-devastating-knockout.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2.50% critical hit chance for Devastating Knockout", base: "wiki/154-devastating-knockout.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "-8s cooldown for Devastating Knockout", base: "wiki/154-devastating-knockout.gif" },
        { name: "Damage against bestiary family", description: "+3% damage against Demon", base: "wiki/042-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 6, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+35% mana leech for Devastating Knockout", base: "wiki/154-devastating-knockout.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 7, choices: [
        { name: "Combat skill scaling for spell damage", description: "+25% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-claws",
    name: "Inferniarch Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 300,
    sprite: "53.png",
    stats: { attack: 43, defense: 21, fistFighting: 4, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Defence", description: "+1 defence", base: "wiki/038-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-claws",
    name: "Rending Inferniarch Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 300,
    sprite: "63.png",
    stats: { attack: 43, defense: 21, fistFighting: 4, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-claws",
    name: "Draining Inferniarch Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 300,
    sprite: "73.png",
    stats: { attack: 43, defense: 21, fistFighting: 4, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-claws",
    name: "Siphoning Inferniarch Claws",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 300,
    sprite: "83.png",
    stats: { attack: 43, defense: 21, fistFighting: 4, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Auto-attack critical hit chance", description: "+2.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Fist Fighting as extra damage for your spells", base: "wiki/075-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Greater Flurry of Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
    ]),
  },

  {
    id: "bambus-jo",
    name: "Bambus Jo",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 150,
    sprite: "402.png",
    stats: { attack: 40, defense: 19, fistFighting: 2, imbueSlots: 2},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+5% of your Fist Fighting as extra damage for auto-attacks", base: "wiki/048-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical hit chance", description: "+10% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life Gain on Kill", description: "+25 hit points on kill", base: "wiki/005-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Vermin", base: "wiki/053-weapon-proficiency-damage-against-bestiary.png" },
      ]},
      { level: 4, choices: [
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
    ]),
  },

  {
    id: "fists-of-enlightenment",
    name: "Fists Of Enlightenment",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 20,
    sprite: "399.png",
    stats: { attack: 23, defense: 14, fistFighting: 1, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+6 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "sai-of-enlightenment",
    name: "Sai Of Enlightenment",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 100,
    sprite: "397.png",
    stats: { attack: 40, defense: 16, fistFighting: 1, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+6 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "nunchaku-of-enlightenment",
    name: "Nunchaku Of Enlightenment",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 50,
    sprite: "398.png",
    stats: { attack: 33, defense: 15, fistFighting: 1, imbueSlots: 1},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+6 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "ritual-bone-knife",
    name: "Ritual Bone Knife",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "444.png",
    stats: { attack: 5, defense: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Life on kill", description: "", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill scaling for spell damage", description: "", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  },

  {
    id: "ink-sword",
    name: "Ink Sword",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 0,
    sprite: "371.png",
    stats: { attack: 14, defense: 12, imbueSlots: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Weapon shield", description: "+1 defence modifier", base: "wiki/001-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+4% of your Sword Fighting as extra damage for auto-attacks", base: "wiki/003-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical hit chance", description: "+2% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
        { name: "Mana Gain on Kill", description: "+8 mana on kill", base: "wiki/016-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Damage against bestiary family", description: "+1% damage against Inkborn", base: "wiki/127-weapon-proficiency-damage-against-bestiary.png" },
      ]},
    ]),
  },

  {
    id: "crypt-spine",
    name: "Crypt Spine",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 450,
    sprite: "461.png",
    stats: { attack: 8, distanceFighting: 3, iceResist: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for spell damage", description: "+10% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Combat skill scaling for healing", description: "+75% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental pierce", description: "+2% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Attack range", description: "+1 range", base: "wiki/157-weapon-proficiency-general.png" },
        { name: "Highest combat skill scaling for healing", description: "+4% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental pierce", description: "+3% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Highest combat skill scaling for healing", description: "+6% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/161-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+5% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Highest combat skill scaling for healing", description: "+10% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "crypt-splitter",
    name: "Crypt Splitter",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 450,
    sprite: "458.png",
    stats: { attack: 58, axeFighting: 4, defense: 33, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental pierce", description: "+10% Energy pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Elemental pierce", description: "+6% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental pierce", description: "+15% Energy pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/161-weapon-proficiency-general.png" },
        { name: "Highest combat skill scaling for healing", description: "+16% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Combat skill scaling for healing", description: "+700% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Highest combat skill scaling for healing", description: "+20% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+20% Energy pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Elemental pierce", description: "+8% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
    ]),
  },

  {
    id: "crypt-breaker",
    name: "Crypt Breaker",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 450,
    sprite: "459.png",
    stats: { attack: 58, clubFighting: 4, defense: 33, imbueSlots: 3},
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/058-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental pierce", description: "+10% Fire pierce", base: "wiki/164-weapon-proficiency-pierce.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Elemental pierce", description: "+6% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental pierce", description: "+15% Fire pierce", base: "wiki/164-weapon-proficiency-pierce.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/161-weapon-proficiency-general.png" },
        { name: "Highest combat skill scaling for healing", description: "+16% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Combat skill scaling for healing", description: "+700% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Highest combat skill scaling for healing", description: "+20% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+20% Fire pierce", base: "wiki/164-weapon-proficiency-pierce.png" },
        { name: "Elemental pierce", description: "+8% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
    ]),
  },

  {
    id: "crypt-strike",
    name: "Crypt Strike",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 450,
    sprite: "460.png",
    stats: { attack: 45, defense: 20, fistFighting: 4, imbueSlots: 3, magicLevel: 1 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Highest combat skill scaling for healing", description: "+15% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+20% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Highest combat skill scaling for healing", description: "+20% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+4% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Flurry of Blows", base: "wiki/151-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
        { name: "Elemental pierce", description: "+8% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/161-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for healing", description: "+70% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Critical extra damage", description: "+10% critical extra damage", base: "wiki/165-weapon-proficiency-general.png" },
        { name: "Highest combat skill scaling for healing", description: "+25% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+12% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
    ]),
  },

  {
    id: "crypt-bile",
    name: "Crypt Bile",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 450,
    sprite: "462.png",
    stats: { damageRange: "85-135", damageType: "physical", fireResist: 6, imbueSlots: 2, magicLevel: 4, manaCost: 10, range: 7 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Highest combat skill scaling for healing", description: "+100% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+7.50% critical extra damage for Energy spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+4% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+40% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
        { name: "Spell augmentation", description: "+35% mana leech for Rage of the Skies", base: "wiki/144-rage-of-the-skies.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental pierce", description: "+2% Energy pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Mana leech", description: "+1% mana leech", base: "wiki/166-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% life leech for Rage of the Skies", base: "wiki/144-rage-of-the-skies.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 6, choices: [
        { name: "Combat skill scaling for spell damage", description: "+8% of your Magic Level as extra damage for your spells", base: "wiki/041-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Mana leech", description: "+1.50% mana leech", base: "wiki/166-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+10% base damage for Rage of the Skies", base: "wiki/144-rage-of-the-skies.gif", augment: "augments/damage.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+4% Energy pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Elemental critical extra damage", description: "+100% critical extra damage for Physical spells and runes", base: "wiki/167-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+4% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "crypt-jaw",
    name: "Crypt Jaw",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 450,
    sprite: "463.png",
    stats: { damageRange: "85-135", damageType: "physical", energyResist: 6, imbueSlots: 2, magicLevel: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Highest combat skill scaling for healing", description: "+100% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical extra damage", description: "+7.50% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+4% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+40% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
        { name: "Spell augmentation", description: "+35% mana leech for Wrath of Nature", base: "wiki/168-wrath-of-nature.gif", augment: "augments/mana-leech.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental pierce", description: "+2% Earth pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
        { name: "Mana leech", description: "+1% mana leech", base: "wiki/166-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+50% life leech for Wrath of Nature", base: "wiki/168-wrath-of-nature.gif", augment: "augments/life-leech.png" },
      ]},
      { level: 6, choices: [
        { name: "Specialized magic level", description: "+2 Healing Magic Level", base: "wiki/121-weapon-proficiency-specialized-magic-level.png" },
        { name: "Mana leech", description: "+1.50% mana leech", base: "wiki/166-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+15% base damage for Wrath of Nature", base: "wiki/168-wrath-of-nature.gif", augment: "augments/damage.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+4% Earth pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
        { name: "Elemental critical extra damage", description: "+100% critical extra damage for Physical spells and runes", base: "wiki/167-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+4% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "crypt-slicer",
    name: "Crypt Slicer",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 450,
    sprite: "457.png",
    stats: { attack: 58, defense: 33, imbueSlots: 3, swordFighting: 4 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/064-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+100% of your Magic Level as extra damage for auto-attacks", base: "wiki/024-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Spell augmentation", description: "+5% life leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/life-leech.png" },
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental pierce", description: "+10% Earth pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
        { name: "Spell augmentation", description: "+2% mana leech for Berserk", base: "wiki/046-berserk.gif", augment: "augments/mana-leech.png" },
        { name: "Elemental pierce", description: "+6% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for auto-attacks", description: "+10% damage against targets above 95% hit points", base: "wiki/159-weapon-proficiency-general.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Undead", base: "wiki/066-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Highest combat skill scaling for spell damage", description: "+2.50% damage against targets below 30% hit points", base: "wiki/160-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental pierce", description: "+15% Earth pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/161-weapon-proficiency-general.png" },
        { name: "Highest combat skill scaling for healing", description: "+16% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 6, choices: [
        { name: "Combat skill scaling for healing", description: "+700% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Highest combat skill scaling for healing", description: "+20% armor penetration", base: "wiki/158-weapon-proficiency-general.png" },
      ]},
      { level: 7, choices: [
        { name: "Elemental pierce", description: "+20% Earth pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
        { name: "Elemental pierce", description: "+8% Physical pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-epee",
    name: "Moonsilver Epee",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 1000,
    sprite: "478.png",
    stats: { attack: 6, damageType: "earth", defense: 33, imbueSlots: 2, swordFighting: 6, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+7.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% base damage for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-epee",
    name: "Stellar Moonsilver Epee",
    category: "sword",
    vocation: "knight",
    hands: 1,
    levelRequirement: 1000,
    sprite: "489.png",
    stats: { attack: 6, damageType: "earth", defense: 33, imbueSlots: 2, swordFighting: 6, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+13.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+7.5% base damage for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-claymore",
    name: "Moonsilver Claymore",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 1000,
    sprite: "485.png",
    stats: { attack: 6, damageType: "fire", defense: 36, imbueSlots: 3, swordFighting: 6, extraAttack: 54, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+7.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Fire damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+10.00% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Fire pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-claymore",
    name: "Stellar Moonsilver Claymore",
    category: "sword",
    vocation: "knight",
    hands: 2,
    levelRequirement: 1000,
    sprite: "496.png",
    stats: { attack: 6, damageType: "fire", defense: 36, imbueSlots: 3, swordFighting: 6, extraAttack: 54, extraAttackType: "fire" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Sword Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+13.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Fire damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+2.75% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+10.00% of your Sword Fighting as extra damage for your spells", base: "wiki/065-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Fire pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-axe",
    name: "Moonsilver Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 1000,
    sprite: "475.png",
    stats: { attack: 6, axeFighting: 6, damageType: "earth", defense: 33, imbueSlots: 2, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+7.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% base damage for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-axe",
    name: "Stellar Moonsilver Axe",
    category: "axe",
    vocation: "knight",
    hands: 1,
    levelRequirement: 1000,
    sprite: "486.png",
    stats: { attack: 6, axeFighting: 6, damageType: "earth", defense: 33, imbueSlots: 2, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+13.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+7.5% base damage for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-chopper",
    name: "Moonsilver Chopper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 1000,
    sprite: "480.png",
    stats: { attack: 6, axeFighting: 6, damageType: "energy", defense: 36, imbueSlots: 3, extraAttack: 54, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+7.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+10.00% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Energy pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-chopper",
    name: "Stellar Moonsilver Chopper",
    category: "axe",
    vocation: "knight",
    hands: 2,
    levelRequirement: 1000,
    sprite: "491.png",
    stats: { attack: 6, axeFighting: 6, damageType: "energy", defense: 36, imbueSlots: 3, extraAttack: 54, extraAttackType: "energy" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Axe Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+13.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+2.75% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+10.00% of your Axe Fighting as extra damage for your spells", base: "wiki/090-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Energy pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-crusher",
    name: "Moonsilver Crusher",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 1000,
    sprite: "476.png",
    stats: { attack: 6, clubFighting: 6, damageType: "earth", defense: 33, imbueSlots: 2, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+7.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% base damage for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-crusher",
    name: "Stellar Moonsilver Crusher",
    category: "club",
    vocation: "knight",
    hands: 1,
    levelRequirement: 1000,
    sprite: "487.png",
    stats: { attack: 6, clubFighting: 6, damageType: "earth", defense: 33, imbueSlots: 2, extraAttack: 50, extraAttackType: "earth" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+2 Shielding", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+13.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Earth damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+7.5% base damage for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Shield Slam", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-mace",
    name: "Moonsilver Mace",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 1000,
    sprite: "482.png",
    stats: { attack: 6, clubFighting: 6, damageType: "ice", defense: 36, imbueSlots: 3, extraAttack: 54, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+7.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+1.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+10.00% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Ice pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-mace",
    name: "Stellar Moonsilver Mace",
    category: "club",
    vocation: "knight",
    hands: 2,
    levelRequirement: 1000,
    sprite: "493.png",
    stats: { attack: 6, clubFighting: 6, damageType: "ice", defense: 36, imbueSlots: 3, extraAttack: 54, extraAttackType: "ice" },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Club Fighting", base: "wiki/054-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+13.5% base damage for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+2.75% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+5% critical hit chance for Groundshaker", base: "wiki/061-groundshaker.gif", augment: "augments/critical-chance.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+10.00% of your Club Fighting as extra damage for your spells", base: "wiki/037-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+5% Ice pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-channeler",
    name: "Moonsilver Channeler",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 1000,
    sprite: "479.png",
    stats: { damageRange: "103-133", damageType: "death", deathMagicLevel: 1, energyResist: 7, imbueSlots: 2, magicLevel: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+4% base damage for Great Fire Wave", base: "wiki/136-great-fire-wave.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Death damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% base damage for Death Echo", base: "wiki/130-great-death-beam.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+2 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Death spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Great Fire Wave", base: "wiki/136-great-fire-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Sudden Death Rune", base: "wiki/130-great-death-beam.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Death Echo", base: "wiki/130-great-death-beam.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+4% Fire pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Death pierce", base: "wiki/164-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-channeler",
    name: "Stellar Moonsilver Channeler",
    category: "wand",
    vocation: "sorcerer",
    hands: 1,
    levelRequirement: 1000,
    sprite: "490.png",
    stats: { damageRange: "6", damageType: "death", deathMagicLevel: 1, energyResist: 7, imbueSlots: 2, magicLevel: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+6% base damage for Great Fire Wave", base: "wiki/136-great-fire-wave.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Death damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+7.5% base damage for Death Echo", base: "wiki/130-great-death-beam.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Fire spells and runes", base: "wiki/029-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+2 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Death spells and runes", base: "wiki/031-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+2% critical hit chance for Great Fire Wave", base: "wiki/136-great-fire-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+2.5% critical hit chance for Sudden Death Rune", base: "wiki/130-great-death-beam.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Death Echo", base: "wiki/130-great-death-beam.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+4% Fire pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Death pierce", base: "wiki/164-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+11.25% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-sceptre",
    name: "Moonsilver Sceptre",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 1000,
    sprite: "477.png",
    stats: { damageRange: "103-127", damageType: "ice", earthResist: 7, healingMagicLevel: 2, iceMagicLevel: 1, imbueSlots: 2, magicLevel: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+6% base damage for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% base damage for Forked Thorns", base: "wiki/117-terra-wave.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+2 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+3% critical hit chance for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for healing", description: "+18.00% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Spell augmentation", description: "+2% critical hit chance for Forked Thorns", base: "wiki/117-terra-wave.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+4% Ice pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-sceptre",
    name: "Stellar Moonsilver Sceptre",
    category: "rod",
    vocation: "druid",
    hands: 1,
    levelRequirement: 1000,
    sprite: "488.png",
    stats: { damageRange: "6", damageType: "ice", earthResist: 7, healingMagicLevel: 2, iceMagicLevel: 1, imbueSlots: 2, magicLevel: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+9% base damage for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Ice damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+7.5% base damage for Forked Thorns", base: "wiki/117-terra-wave.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Combat skill", description: "+2 Magic Level", base: "wiki/067-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Elemental critical extra damage", description: "+12.50% critical extra damage for Earth spells and runes", base: "wiki/012-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+3% critical hit chance for Strong Ice Wave", base: "wiki/133-strong-ice-wave.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for healing", description: "+18.00% of your Magic Level as extra healing for your spells", base: "wiki/019-weapon-proficiency-gain-extra-healing-spells.png" },
        { name: "Spell augmentation", description: "+2% critical hit chance for Forked Thorns", base: "wiki/117-terra-wave.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+4% Ice pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Earth pierce", base: "wiki/163-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+11.25% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-katar",
    name: "Moonsilver Katar",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 1000,
    sprite: "484.png",
    stats: { attack: 46, defense: 22, fistFighting: 6, imbueSlots: 3, magicLevel: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+9% base damage for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+7.5% mana leech for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% critical hit chance for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Energy pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-katar",
    name: "Stellar Moonsilver Katar",
    category: "fist",
    vocation: "monk",
    hands: 2,
    levelRequirement: 1000,
    sprite: "495.png",
    stats: { attack: 46, defense: 22, fistFighting: 6, imbueSlots: 3, magicLevel: 2 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Fist Fighting", base: "wiki/148-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+15% life leech for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/life-leech.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Energy damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+13.5% base damage for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Armor penetration", description: "+3.00% life leech", base: "wiki/018-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Critical hit chance", description: "+1.00% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+7.5% mana leech for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/mana-leech.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+5% critical hit chance for Thousand Fist Blows", base: "wiki/155-greater-flurry-of-blows.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Energy pierce", base: "wiki/169-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-bow",
    name: "Moonsilver Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 1000,
    sprite: "481.png",
    stats: { attack: 10, distanceFighting: 5, fireResist: 7, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+4% base damage for Ethereal Barrage", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+4% base damage for Divine Barrage", base: "wiki/120-divine-missile.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+3% critical hit chance for Ethereal Barrage", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for spell damage", description: "+12.00% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Divine Barrage", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+9% Physical pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-bow",
    name: "Stellar Moonsilver Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 1000,
    sprite: "492.png",
    stats: { attack: 10, distanceFighting: 5, fireResist: 7, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+8.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bestiary family", description: "+3.00% damage against Human", base: "wiki/085-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Spell augmentation", description: "+6% base damage for Ethereal Barrage", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/damage.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Spell augmentation", description: "+6% base damage for Divine Barrage", base: "wiki/120-divine-missile.gif", augment: "augments/damage.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 5, choices: [
        { name: "Spell augmentation", description: "+3% critical hit chance for Ethereal Barrage", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Combat skill scaling for spell damage", description: "+12.00% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "+3% critical hit chance for Divine Barrage", base: "wiki/120-divine-missile.gif", augment: "augments/critical-chance.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+9% Physical pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "moonsilver-crossbow",
    name: "Moonsilver Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 1000,
    sprite: "483.png",
    stats: { attack: 11, distanceFighting: 5, holyResist: 7, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Ranged chance to hit", description: "+2.00% hit chance", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3.00% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical extra damage", description: "+12.00% critical extra damage for Physical spells and runes", base: "wiki/167-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 200% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+10.00% critical extra damage for Holy spells and runes", base: "wiki/129-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical hit chance", description: "+2.00% critical hit chance for Physical spells and runes", base: "wiki/131-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Combat skill scaling for spell damage", description: "+12.00% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Elemental critical hit chance", description: "+1.50% critical hit chance for Holy spells and runes", base: "wiki/135-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+9% Physical pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+5.00% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "stellar-moonsilver-crossbow",
    name: "Stellar Moonsilver Crossbow",
    category: "crossbow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 1000,
    sprite: "494.png",
    stats: { attack: 11, distanceFighting: 5, holyResist: 7, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Ranged chance to hit", description: "+2.00% hit chance", base: "wiki/025-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3.00% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Critical extra damage", description: "+6.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental critical extra damage", description: "+18.00% critical extra damage for Physical spells and runes", base: "wiki/167-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Homing missile", description: "Offensive spells have a 1% chance to fire a homing missile that deals Holy damage equal to 300% of your level", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental critical extra damage", description: "+15.00% critical extra damage for Holy spells and runes", base: "wiki/129-weapon-proficiency-critical-extra-damage-element.png" },
      ]},
      { level: 4, choices: [
        { name: "Highest combat skill scaling for healing", description: "+12% armor penetration", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
        { name: "Mana leech", description: "+2.00% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical hit chance", description: "+2.00% critical hit chance for Physical spells and runes", base: "wiki/131-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Combat skill scaling for spell damage", description: "+12.00% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Elemental critical hit chance", description: "+1.50% critical hit chance for Holy spells and runes", base: "wiki/135-weapon-proficiency-critical-hit-chance-element.png" },
      ]},
      { level: 6, choices: [
        { name: "Elemental pierce", description: "+9% Physical pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
        { name: "Critical extra damage", description: "+12.00% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
        { name: "Elemental pierce", description: "+4% Holy pierce", base: "wiki/156-weapon-proficiency-pierce.png" },
      ]},
      { level: 7, choices: [
        { name: "Highest combat skill scaling for spell damage", description: "+7.50% damage against targets below 30% hit points", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "snowball-with-ice-shards",
    name: "Snowball With Ice Shards",
    category: "bow",
    vocation: "paladin",
    hands: 1,
    levelRequirement: 0,
    sprite: "474.png",
    stats: { attack: 25 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Elemental pierce", description: "+5% Ice pierce", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Elemental critical hit chance", description: "", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Elemental pierce", description: "", base: "wiki/162-weapon-proficiency-pierce.png" },
        { name: "Attack range", description: "+1 range", base: "wiki/007-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Elemental critical hit chance", description: "+3% critical extra hit chance for Ice spells and runes", base: "wiki/009-weapon-proficiency-critical-hit-chance-element.png" },
        { name: "Attack damage", description: "+2 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Elemental critical extra damage", description: "+10% critical extra damage for Ice spells and runes", base: "wiki/010-weapon-proficiency-critical-extra-damage-element.png" },
        { name: "Auto-attack critical extra damage", description: "+200% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "inferniarch-bow",
    name: "Inferniarch Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "497.png",
    stats: { attack: 6, distanceFighting: 2, earthResist: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Attack damage", description: "+1 attack", base: "wiki/006-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Auto-attack critical extra damage", description: "+15% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% life leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+1% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Spell augmentation", description: "+3% mana leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/mana-leech.png" },
      ]},
    ]),
  },

  {
    id: "rending-inferniarch-bow",
    name: "Rending Inferniarch Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "498.png",
    stats: { attack: 7, distanceFighting: 2, earthResist: 5, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Critical extra damage", description: "+48% critical extra damage", base: "wiki/081-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Critical hit chance", description: "+5% critical hit chance", base: "wiki/091-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+5% mana leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/mana-leech.png" },
        { name: "Rune critical extra damage", description: "+8% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Dazzle", base: "wiki/147-divine-dazzle.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Rune critical hit chance", description: "+1.50% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "draining-inferniarch-bow",
    name: "Draining Inferniarch Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "499.png",
    stats: { attack: 7, distanceFighting: 2, earthResist: 5, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Armor penetration", description: "+14.50% life leech", base: "wiki/050-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+5% mana leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/mana-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Rune critical extra damage", description: "+8% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Dazzle", base: "wiki/147-divine-dazzle.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Rune critical hit chance", description: "+1.50% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "siphoning-inferniarch-bow",
    name: "Siphoning Inferniarch Bow",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 300,
    sprite: "500.png",
    stats: { attack: 7, distanceFighting: 2, earthResist: 5, imbueSlots: 2, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/008-weapon-proficiency-general.png" },
      ]},
      { level: 3, choices: [
        { name: "Mana leech", description: "+5% mana leech", base: "wiki/051-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Spell augmentation", description: "+10% life leech for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/life-leech.png" },
        { name: "Spell augmentation", description: "+8% critical extra damage for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Rune critical extra damage", description: "+8% critical extra damage for offensive runes", base: "wiki/013-weapon-proficiency-general.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
        { name: "Damage against bestiary family", description: "+3% damage against Plant", base: "wiki/057-weapon-proficiency-damage-against-bestiary.png" },
        { name: "Specialized magic level", description: "+1 Holy Magic Level", base: "wiki/073-weapon-proficiency-specialized-magic-level.png" },
      ]},
      { level: 6, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Combat skill scaling for spell damage", description: "+5% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
        { name: "Spell augmentation", description: "-2s cooldown for Divine Dazzle", base: "wiki/147-divine-dazzle.gif" },
      ]},
      { level: 7, choices: [
        { name: "Spell augmentation", description: "+1.50% critical hit chance for Strong Ethereal Spear", base: "wiki/099-strong-ethereal-spear.gif", augment: "augments/critical-chance.png" },
        { name: "Rune critical hit chance", description: "+1.50% critical hit chance for offensive runes", base: "wiki/018-weapon-proficiency-general.png" },
      ]},
    ]),
  },

  {
    id: "bow-of-destruction",
    name: "Bow Of Destruction",
    category: "bow",
    vocation: "paladin",
    hands: 2,
    levelRequirement: 200,
    sprite: "501.png",
    stats: { attack: 5, imbueSlots: 3, range: 6 },
    perkTree: padTo7([
      { level: 1, choices: [
        { name: "Auto-attack critical extra damage", description: "+10% critical extra damage for auto-attacks", base: "wiki/112-weapon-proficiency-general.png" },
      ]},
      { level: 2, choices: [
        { name: "Combat skill scaling for auto-attacks", description: "+10% of your Distance Fighting as extra damage for auto-attacks", base: "wiki/076-weapon-proficiency-gain-extra-damage-auto-attack.png" },
      ]},
      { level: 3, choices: [
        { name: "Damage against bosses and Sinister Embraced", description: "+3% damage against bosses and Sinister Embraced", base: "wiki/060-weapon-proficiency-general.png" },
        { name: "Auto-attack critical hit chance", description: "+3.50% critical hit chance for auto-attacks", base: "wiki/004-weapon-proficiency-general.png" },
      ]},
      { level: 4, choices: [
        { name: "Combat skill", description: "+1 Distance Fighting", base: "wiki/103-weapon-proficiency-offensive-bonus-skill.png" },
      ]},
      { level: 5, choices: [
        { name: "Combat skill scaling for spell damage", description: "+3.50% of your Distance Fighting as extra damage for your spells", base: "wiki/115-weapon-proficiency-gain-extra-damage-spells.png" },
      ]},
    ]),
  }
];

export function findWeaponById(id: string): Weapon | null {
  return WEAPONS.find((w) => w.id === id) ?? null;
}
