/**
 * Imbuement reference data.
 *
 * Sources (visited 2026-05-08):
 *   - https://www.tibiabuddy.com/blog/imbuement-guide-2026
 *   - https://tibiavault.com/imbuing-guide/
 *   - https://tibia.fandom.com/wiki/Imbuing  (couldn't fetch directly — 403 to bots — but cross-referenced via the above)
 *
 * Out of scope for v1:
 *   - Support imbuements (Swiftness / Featherweight / Vibrancy) — Powerful tier
 *     ingredients are documented but Basic/Intricate are inconsistent across
 *     guides. Leave for a follow-up once we have a primary source.
 *   - Astral Source / Powerful access requirements (boss kills) — purely
 *     informational, not part of the cost calc.
 *
 * NPC gold fee per tier is uniform across all imbuements:
 *   Basic 7,500 — Intricate 60,000 — Powerful 250,000
 */

export const IMBUE_GOLD_FEE = {
  basic: 7_500,
  intricate: 60_000,
  powerful: 250_000,
} as const;

/**
 * Alternative payment at the imbuing shrine: a fixed number of Gold Tokens
 * substitutes the gp fee per tier. Independent of the imbuement chosen.
 */
export const IMBUE_GOLD_TOKENS = {
  basic: 2,
  intricate: 4,
  powerful: 6,
} as const;

export type Tier = keyof typeof IMBUE_GOLD_FEE;
export const TIERS: readonly Tier[] = ["basic", "intricate", "powerful"];

export interface Ingredient {
  name: string;
  qty: number;
}

export interface Imbuement {
  /** Public name shown on the card header. */
  name: string;
  /** What stat or skill the imbuement affects. */
  affects: string;
  /** Bonus copy per tier (e.g. "+5% damage" / "+1 Sword"). */
  bonus: { basic: string; intricate: string; powerful: string };
  /** Ingredient list per tier. Powerful is cumulative — the wiki lists every
   *  item required, not just the new one. */
  ingredients: {
    basic: readonly Ingredient[];
    intricate: readonly Ingredient[];
    powerful: readonly Ingredient[];
  };
  /** Optional note shown below the card (e.g. caveats, source uncertainty). */
  note?: string;
}

export interface ImbuementCategory {
  id: string;
  label: string;
  imbuements: readonly Imbuement[];
}

// ---------------------------------------------------------------------------
// Combat — utility-style imbuements that affect direct damage / sustain.
// ---------------------------------------------------------------------------

const COMBAT: readonly Imbuement[] = [
  {
    name: "Vampirism",
    affects: "Life Leech",
    bonus: { basic: "+5%", intricate: "+10%", powerful: "+25%" },
    ingredients: {
      basic:     [{ name: "Vampire Teeth", qty: 25 }],
      intricate: [{ name: "Vampire Teeth", qty: 25 }, { name: "Bloody Pincers", qty: 15 }],
      powerful:  [{ name: "Vampire Teeth", qty: 25 }, { name: "Bloody Pincers", qty: 15 }, { name: "Piece of Dead Brain", qty: 5 }],
    },
  },
  {
    name: "Void",
    affects: "Mana Leech",
    bonus: { basic: "+3%", intricate: "+5%", powerful: "+8%" },
    ingredients: {
      basic:     [{ name: "Rope Belts", qty: 25 }],
      intricate: [{ name: "Rope Belts", qty: 25 }, { name: "Silencer Claws", qty: 25 }],
      powerful:  [{ name: "Rope Belts", qty: 25 }, { name: "Silencer Claws", qty: 25 }, { name: "Some Grimeleech Wings", qty: 5 }],
    },
  },
  {
    name: "Strike",
    affects: "Critical Hit",
    bonus: {
      basic:     "+5% crit chance · +5% damage",
      intricate: "+5% crit chance · +15% damage",
      powerful:  "+5% crit chance · +40% damage",
    },
    ingredients: {
      basic:     [{ name: "Protective Charms", qty: 20 }],
      intricate: [{ name: "Protective Charms", qty: 20 }, { name: "Sabreteeth", qty: 25 }],
      powerful:  [{ name: "Protective Charms", qty: 20 }, { name: "Sabreteeth", qty: 25 }, { name: "Vexclaw Talons", qty: 5 }],
    },
  },
];

// ---------------------------------------------------------------------------
// Skill Boost — flat skill / magic level increase while equipped.
// ---------------------------------------------------------------------------

const SKILL_BOOST: readonly Imbuement[] = [
  {
    name: "Slash",
    affects: "Sword Fighting",
    bonus: { basic: "+1 Sword", intricate: "+2 Sword", powerful: "+4 Sword" },
    ingredients: {
      basic:     [{ name: "Lion's Mane", qty: 25 }],
      intricate: [{ name: "Lion's Mane", qty: 25 }, { name: "Mooh'tah Shell", qty: 25 }],
      powerful:  [{ name: "Lion's Mane", qty: 25 }, { name: "Mooh'tah Shell", qty: 25 }, { name: "War Crystal", qty: 5 }],
    },
  },
  {
    name: "Chop",
    affects: "Axe Fighting",
    bonus: { basic: "+1 Axe", intricate: "+2 Axe", powerful: "+4 Axe" },
    ingredients: {
      basic:     [{ name: "Piece of Scarab Shell", qty: 25 }],
      intricate: [{ name: "Piece of Scarab Shell", qty: 25 }, { name: "Brimstone Fangs", qty: 25 }],
      powerful:  [{ name: "Piece of Scarab Shell", qty: 25 }, { name: "Brimstone Fangs", qty: 25 }, { name: "Piece of Royal Steel", qty: 5 }],
    },
  },
  {
    name: "Bash",
    affects: "Club Fighting",
    bonus: { basic: "+1 Club", intricate: "+2 Club", powerful: "+4 Club" },
    ingredients: {
      basic:     [{ name: "Cyclops Toe", qty: 20 }],
      intricate: [{ name: "Cyclops Toe", qty: 20 }, { name: "Ogre Nose Ring", qty: 15 }],
      powerful:  [{ name: "Cyclops Toe", qty: 20 }, { name: "Ogre Nose Ring", qty: 15 }, { name: "Warmaster's Wristguards", qty: 5 }],
    },
  },
  {
    name: "Precision",
    affects: "Distance Fighting",
    bonus: { basic: "+1 Distance", intricate: "+2 Distance", powerful: "+4 Distance" },
    ingredients: {
      basic:     [{ name: "Elven Scouting Glass", qty: 25 }],
      intricate: [{ name: "Elven Scouting Glass", qty: 25 }, { name: "Compass", qty: 20 }],
      powerful:  [{ name: "Elven Scouting Glass", qty: 25 }, { name: "Compass", qty: 20 }, { name: "Soul Orb", qty: 5 }],
    },
  },
  {
    name: "Knock",
    affects: "Fist Fighting",
    bonus: { basic: "+1 Fist", intricate: "+2 Fist", powerful: "+4 Fist" },
    ingredients: {
      basic:     [{ name: "Cyclops Toe", qty: 20 }],
      intricate: [{ name: "Cyclops Toe", qty: 20 }, { name: "Ogre Nose Ring", qty: 15 }],
      powerful:  [{ name: "Cyclops Toe", qty: 20 }, { name: "Ogre Nose Ring", qty: 15 }, { name: "Warmaster's Wristguards", qty: 5 }],
    },
    note: "Some sources list this as \"Punch\". Same materials as Bash per current guides — verify against in-game NPC if possible.",
  },
  {
    name: "Epiphany",
    affects: "Magic Level",
    bonus: { basic: "+1 ML", intricate: "+2 ML", powerful: "+4 ML" },
    ingredients: {
      basic:     [{ name: "Elvish Talisman", qty: 25 }],
      intricate: [{ name: "Elvish Talisman", qty: 25 }, { name: "Broken Shamanic Staff", qty: 15 }],
      powerful:  [{ name: "Elvish Talisman", qty: 25 }, { name: "Broken Shamanic Staff", qty: 15 }, { name: "Strand of Medusa Hair", qty: 15 }],
    },
  },
];

// ---------------------------------------------------------------------------
// Elemental Damage — converts a portion of weapon damage to an element.
// ---------------------------------------------------------------------------

const ELEMENTAL_DAMAGE: readonly Imbuement[] = [
  {
    name: "Scorch",
    affects: "Fire damage",
    bonus: { basic: "+10%", intricate: "+25%", powerful: "+50%" },
    ingredients: {
      basic:     [{ name: "Fiery Heart", qty: 25 }],
      intricate: [{ name: "Fiery Heart", qty: 25 }, { name: "Green Dragon Scale", qty: 5 }],
      powerful:  [{ name: "Fiery Heart", qty: 25 }, { name: "Green Dragon Scale", qty: 5 }, { name: "Demon Horn", qty: 5 }],
    },
  },
  {
    name: "Venom",
    affects: "Earth damage",
    bonus: { basic: "+10%", intricate: "+25%", powerful: "+50%" },
    ingredients: {
      basic:     [{ name: "Swamp Grass", qty: 25 }],
      intricate: [{ name: "Swamp Grass", qty: 25 }, { name: "Poisonous Slime", qty: 20 }],
      powerful:  [{ name: "Swamp Grass", qty: 25 }, { name: "Poisonous Slime", qty: 20 }, { name: "Slime Heart", qty: 2 }],
    },
  },
  {
    name: "Frost",
    affects: "Ice damage",
    bonus: { basic: "+10%", intricate: "+25%", powerful: "+50%" },
    ingredients: {
      basic:     [{ name: "Frosty Heart", qty: 25 }],
      intricate: [{ name: "Frosty Heart", qty: 25 }, { name: "Seacrest Hair", qty: 10 }],
      powerful:  [{ name: "Frosty Heart", qty: 25 }, { name: "Seacrest Hair", qty: 10 }, { name: "Polar Bear Paw", qty: 5 }],
    },
  },
  {
    name: "Electrify",
    affects: "Energy damage",
    bonus: { basic: "+10%", intricate: "+25%", powerful: "+50%" },
    ingredients: {
      basic:     [{ name: "Rorc Feather", qty: 25 }],
      intricate: [{ name: "Rorc Feather", qty: 25 }, { name: "Peacock Feather Fan", qty: 5 }],
      powerful:  [{ name: "Rorc Feather", qty: 25 }, { name: "Peacock Feather Fan", qty: 5 }, { name: "Energy Vein", qty: 1 }],
    },
  },
  {
    name: "Reap",
    affects: "Death damage",
    bonus: { basic: "+10%", intricate: "+25%", powerful: "+50%" },
    ingredients: {
      basic:     [{ name: "Pile of Grave Earth", qty: 25 }],
      intricate: [{ name: "Pile of Grave Earth", qty: 25 }, { name: "Demonic Skeletal Hand", qty: 20 }],
      powerful:  [{ name: "Pile of Grave Earth", qty: 25 }, { name: "Demonic Skeletal Hand", qty: 20 }, { name: "Petrified Scream", qty: 5 }],
    },
  },
];

// ---------------------------------------------------------------------------
// Elemental Protection — reduces incoming damage of a specific element.
// ---------------------------------------------------------------------------

const PROTECTION: readonly Imbuement[] = [
  {
    name: "Dragon Hide",
    affects: "Fire protection",
    bonus: { basic: "+3%", intricate: "+8%", powerful: "+15%" },
    ingredients: {
      basic:     [{ name: "Green Dragon Leather", qty: 20 }],
      intricate: [{ name: "Green Dragon Leather", qty: 20 }, { name: "Blazing Bone", qty: 10 }],
      powerful:  [{ name: "Green Dragon Leather", qty: 20 }, { name: "Blazing Bone", qty: 10 }, { name: "Draken Sulphur", qty: 5 }],
    },
  },
  {
    name: "Quara Scale",
    affects: "Ice protection",
    bonus: { basic: "+3%", intricate: "+8%", powerful: "+15%" },
    ingredients: {
      basic:     [{ name: "Winter Wolf Fur", qty: 25 }],
      intricate: [{ name: "Winter Wolf Fur", qty: 25 }, { name: "Thick Fur", qty: 15 }],
      powerful:  [{ name: "Winter Wolf Fur", qty: 25 }, { name: "Thick Fur", qty: 15 }, { name: "Deepling Warts", qty: 10 }],
    },
  },
  {
    name: "Lich Shroud",
    affects: "Death protection",
    bonus: { basic: "+2%", intricate: "+5%", powerful: "+10%" },
    ingredients: {
      basic:     [{ name: "Flask of Embalming Fluid", qty: 25 }],
      intricate: [{ name: "Flask of Embalming Fluid", qty: 25 }, { name: "Gloom Wolf Fur", qty: 20 }],
      powerful:  [{ name: "Flask of Embalming Fluid", qty: 25 }, { name: "Gloom Wolf Fur", qty: 20 }, { name: "Mystical Hourglass", qty: 5 }],
    },
  },
  {
    name: "Cloud Fabric",
    affects: "Energy protection",
    bonus: { basic: "+3%", intricate: "+8%", powerful: "+15%" },
    ingredients: {
      basic:     [{ name: "Wyvern Talisman", qty: 20 }],
      intricate: [{ name: "Wyvern Talisman", qty: 20 }, { name: "Crawler Head Plating", qty: 15 }],
      powerful:  [{ name: "Wyvern Talisman", qty: 20 }, { name: "Crawler Head Plating", qty: 15 }, { name: "Wyrm Scale", qty: 10 }],
    },
  },
  {
    name: "Snake Skin",
    affects: "Earth protection",
    bonus: { basic: "+3%", intricate: "+8%", powerful: "+15%" },
    ingredients: {
      basic:     [{ name: "Piece of Swampling Wood", qty: 25 }],
      intricate: [{ name: "Piece of Swampling Wood", qty: 25 }, { name: "Snake Skin", qty: 20 }],
      powerful:  [{ name: "Piece of Swampling Wood", qty: 25 }, { name: "Snake Skin", qty: 20 }, { name: "Brimstone Fangs", qty: 10 }],
    },
  },
  {
    name: "Demon Presence",
    affects: "Holy protection",
    bonus: { basic: "+3%", intricate: "+8%", powerful: "+15%" },
    ingredients: {
      basic:     [{ name: "Cultish Robe", qty: 25 }],
      intricate: [{ name: "Cultish Robe", qty: 25 }, { name: "Cultish Mask", qty: 25 }],
      powerful:  [{ name: "Cultish Robe", qty: 25 }, { name: "Cultish Mask", qty: 25 }, { name: "Hellspawn Tail", qty: 20 }],
    },
  },
];

// ---------------------------------------------------------------------------

export const IMBUEMENT_CATEGORIES: readonly ImbuementCategory[] = [
  { id: "combat",     label: "Combat",              imbuements: COMBAT },
  { id: "skill",      label: "Skill Boost",         imbuements: SKILL_BOOST },
  { id: "protection", label: "Elemental Protection", imbuements: PROTECTION },
  { id: "damage",     label: "Elemental Damage",    imbuements: ELEMENTAL_DAMAGE },
];
