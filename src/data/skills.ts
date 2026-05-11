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

// Order: indices 0-6 = the 7 regular blessings counted by the death-penalty
// formula (each grants -8% exp/skill loss). Index 7 = Twist of Fate, special:
// it does NOT reduce loss; it only protects regulars+AoL on a PvP death.
// Source: TibiaWiki — Blessings, Twist of Fate.
export const BLESSINGS = [
  { name: "Wisdom of Solitude",     color: "#7DD3FC" },
  { name: "Spark of the Phoenix",   color: "#FBBF24" },
  { name: "Fire of the Suns",       color: "#F97316" },
  { name: "Spiritual Shielding",    color: "#E5E7EB" },
  { name: "Embrace of Tibia",       color: "#86EFAC" },
  { name: "Blood of the Mountain",  color: "#DC2626" },
  { name: "Heart of the Mountain", color: "#B7825E" },
  { name: "Twist of Fate",          color: "#F472B6" },
] as const;

/** Index of Twist of Fate inside BLESSINGS / the per-character blessings array. */
export const TWIST_OF_FATE_INDEX = 7;

/** Number of "regular" blessings (indices 0..6). ToF is excluded. */
export const REGULAR_BLESSINGS_COUNT = 7;
