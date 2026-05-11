export const VOCATIONS = [
  { value: "knight",   label: "Knight" },
  { value: "paladin",  label: "Paladin" },
  { value: "sorcerer", label: "Sorcerer" },
  { value: "druid",    label: "Druid" },
  { value: "monk",     label: "Monk" },
] as const;

export type Vocation = (typeof VOCATIONS)[number]["value"];

export const SKILLS_BY_VOCATION: Record<Vocation, readonly string[]> = {
  knight:   ["Magic level", "Shielding", "Sword", "Axe", "Club"],
  paladin:  ["Magic level", "Distance", "Shielding"],
  sorcerer: ["Magic level", "Shielding"],
  druid:    ["Magic level", "Shielding"],
  monk:     ["Magic level", "Fist", "Shielding"],
};

export const ALL_SKILLS = [
  "Magic level",
  "Sword",
  "Axe",
  "Club",
  "Distance",
  "Shielding",
  "Fist",
  "Fishing",
] as const;

// Data order (DO NOT REORDER — death-penalty math + persisted localStorage
// rely on these indices): indices 0-6 = the 7 regular blessings counted by
// the death-penalty formula (each grants -8% exp/skill loss). Index 7 =
// Twist of Fate, special: it does NOT reduce loss; it only protects
// regulars+AoL on a PvP death. Source: TibiaWiki — Blessings, Twist of Fate.
// The UI renders these in a DIFFERENT order — see BLESSING_DISPLAY_ORDER.
export const BLESSINGS = [
  { name: "Wisdom of Solitude",    color: "#7DD3FC", sprite: "/sprites/blessings/solitude.png" },
  { name: "Spark of the Phoenix",  color: "#FBBF24", sprite: "/sprites/blessings/phoenix.png" },
  { name: "Fire of the Suns",      color: "#F97316", sprite: "/sprites/blessings/suns.png" },
  { name: "Spiritual Shielding",   color: "#E5E7EB", sprite: "/sprites/blessings/spiritual.png" },
  { name: "Embrace of Tibia",      color: "#86EFAC", sprite: "/sprites/blessings/embrace.png" },
  { name: "Blood of the Mountain", color: "#DC2626", sprite: "/sprites/blessings/blood_of_the_mountain.png" },
  { name: "Heart of the Mountain", color: "#B7825E", sprite: "/sprites/blessings/heart_of_the_mountain.png" },
  { name: "Twist of Fate",         color: "#F472B6", sprite: "/sprites/blessings/twist_of_fate.png" },
] as const;

/** Visual order shown in the Character Sheet. Each entry is a DATA index
 *  into BLESSINGS — Twist of Fate first, then the 7 regulars from cheapest
 *  to most expensive. Keep this as the only place display order is defined. */
export const BLESSING_DISPLAY_ORDER = [7, 0, 1, 2, 3, 4, 6, 5] as const;

/** Index of Twist of Fate inside BLESSINGS / the per-character blessings array. */
export const TWIST_OF_FATE_INDEX = 7;

/** Number of "regular" blessings (indices 0..6). ToF is excluded. */
export const REGULAR_BLESSINGS_COUNT = 7;
