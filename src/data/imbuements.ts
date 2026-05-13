/**
 * Imbuement reference data — 24 imbuements across 5 categories.
 *
 * All three tiers (Basic / Intricate / Powerful) verified 2026-05-13 from
 * owner-supplied tibia.com library screenshots. Recipes are cumulative:
 * Intricate adds a 2nd ingredient to Basic's 1st, Powerful adds a 3rd.
 *
 * Out of scope (intentional):
 *   - Astral Source / Powerful access requirements (the boss kills needed
 *     to unlock Powerful tier on a character) — purely informational, not
 *     part of the cost calc.
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
      basic:     [{ name: "Rope Belt", qty: 25 }],
      intricate: [{ name: "Rope Belt", qty: 25 }, { name: "Silencer Claws", qty: 25 }],
      powerful:  [{ name: "Rope Belt", qty: 25 }, { name: "Silencer Claws", qty: 25 }, { name: "Some Grimeleech Wings", qty: 5 }],
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
      basic:     [{ name: "Protective Charm", qty: 20 }],
      intricate: [{ name: "Protective Charm", qty: 20 }, { name: "Sabretooth", qty: 25 }],
      powerful:  [{ name: "Protective Charm", qty: 20 }, { name: "Sabretooth", qty: 25 }, { name: "Vexclaw Talon", qty: 5 }],
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
      basic:     [{ name: "Orc Tooth", qty: 20 }],
      intricate: [{ name: "Orc Tooth", qty: 20 }, { name: "Battle Stone", qty: 25 }],
      powerful:  [{ name: "Orc Tooth", qty: 20 }, { name: "Battle Stone", qty: 25 }, { name: "Moohtah Horn", qty: 20 }],
    },
  },
  {
    name: "Bash",
    affects: "Club Fighting",
    bonus: { basic: "+1 Club", intricate: "+2 Club", powerful: "+4 Club" },
    ingredients: {
      basic:     [{ name: "Cyclops Toe", qty: 20 }],
      intricate: [{ name: "Cyclops Toe", qty: 20 }, { name: "Ogre Nose Ring", qty: 15 }],
      powerful:  [{ name: "Cyclops Toe", qty: 20 }, { name: "Ogre Nose Ring", qty: 15 }, { name: "Warmaster's Wristguards", qty: 10 }],
    },
  },
  {
    name: "Precision",
    affects: "Distance Fighting",
    bonus: { basic: "+1 Distance", intricate: "+2 Distance", powerful: "+4 Distance" },
    ingredients: {
      basic:     [{ name: "Elven Scouting Glass", qty: 25 }],
      intricate: [{ name: "Elven Scouting Glass", qty: 25 }, { name: "Elven Hoof", qty: 20 }],
      powerful:  [{ name: "Elven Scouting Glass", qty: 25 }, { name: "Elven Hoof", qty: 20 }, { name: "Metal Spike", qty: 10 }],
    },
  },
  {
    name: "Punch",
    affects: "Fist Fighting",
    bonus: { basic: "+1 Fist", intricate: "+2 Fist", powerful: "+4 Fist" },
    // NOTE: Punch is the lone exception to the cumulative-qty rule —
    // tibia.com lists DIFFERENT quantities for Tarantula Egg / Mantassin
    // Tail between Intricate (20 + 25) and Powerful (25 + 20). All other
    // imbuements keep stable quantities across tiers; Punch does not.
    // Reproduce the guide verbatim so the cost calc and material lookups
    // stay correct against the in-game NPC.
    ingredients: {
      basic:     [{ name: "Tarantula Egg", qty: 20 }],
      intricate: [{ name: "Tarantula Egg", qty: 20 }, { name: "Mantassin Tail", qty: 25 }],
      powerful:  [{ name: "Tarantula Egg", qty: 25 }, { name: "Mantassin Tail", qty: 20 }, { name: "Gold-Brocaded Cloth", qty: 15 }],
    },
  },
  {
    name: "Blockade",
    affects: "Shielding",
    bonus: { basic: "+1 Shield", intricate: "+2 Shield", powerful: "+4 Shield" },
    ingredients: {
      basic:     [{ name: "Piece of Scarab Shell", qty: 20 }],
      intricate: [{ name: "Piece of Scarab Shell", qty: 20 }, { name: "Brimstone Shell", qty: 25 }],
      powerful:  [{ name: "Piece of Scarab Shell", qty: 20 }, { name: "Brimstone Shell", qty: 25 }, { name: "Frazzle Skin", qty: 25 }],
    },
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
// Support — utility imbuements (capacity, speed, paralysis deflection).
// Basic tier verified against in-game library; Intricate / Powerful ingredient
// lists are placeholders pending the next photo passes.
// ---------------------------------------------------------------------------

const SUPPORT: readonly Imbuement[] = [
  {
    name: "Featherweight",
    affects: "Capacity",
    bonus: { basic: "+3%", intricate: "+8%", powerful: "+15%" },
    ingredients: {
      basic:     [{ name: "Fairy Wings", qty: 20 }],
      intricate: [{ name: "Fairy Wings", qty: 20 }, { name: "Little Bowl of Myrrh", qty: 10 }],
      powerful:  [{ name: "Fairy Wings", qty: 20 }, { name: "Little Bowl of Myrrh", qty: 10 }, { name: "Goosebump Leather", qty: 5 }],
    },
  },
  {
    name: "Swiftness",
    affects: "Speed",
    bonus: { basic: "+10 Speed", intricate: "+15 Speed", powerful: "+30 Speed" },
    ingredients: {
      basic:     [{ name: "Damselfly Wing", qty: 15 }],
      intricate: [{ name: "Damselfly Wing", qty: 15 }, { name: "Compass", qty: 25 }],
      powerful:  [{ name: "Damselfly Wing", qty: 15 }, { name: "Compass", qty: 25 }, { name: "Waspoid Wing", qty: 20 }],
    },
  },
  {
    name: "Vibrancy",
    affects: "Paralysis Deflection",
    bonus: { basic: "15% remove", intricate: "25% remove", powerful: "50% remove" },
    ingredients: {
      basic:     [{ name: "Wereboar Hooves", qty: 20 }],
      intricate: [{ name: "Wereboar Hooves", qty: 20 }, { name: "Crystallized Anger", qty: 15 }],
      powerful:  [{ name: "Wereboar Hooves", qty: 20 }, { name: "Crystallized Anger", qty: 15 }, { name: "Quill", qty: 5 }],
    },
  },
];

// ---------------------------------------------------------------------------

export const IMBUEMENT_CATEGORIES: readonly ImbuementCategory[] = [
  { id: "combat",     label: "Combat",               imbuements: COMBAT },
  { id: "skill",      label: "Skill Boost",          imbuements: SKILL_BOOST },
  { id: "damage",     label: "Elemental Damage",     imbuements: ELEMENTAL_DAMAGE },
  { id: "protection", label: "Elemental Protection", imbuements: PROTECTION },
  { id: "support",    label: "Support",              imbuements: SUPPORT },
];
