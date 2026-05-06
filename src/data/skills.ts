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

// Order matches Tibia's blessing list. Index 6 = Twist of Fate (special).
export const BLESSINGS = [
  { name: "Wisdom of Solitude",    color: "#7DD3FC" },
  { name: "Spark of the Phoenix",  color: "#FBBF24" },
  { name: "Fire of the Suns",      color: "#F97316" },
  { name: "Spiritual Shielding",   color: "#E5E7EB" },
  { name: "Embrace of Tibia",      color: "#86EFAC" },
  { name: "Heart of the Mountain", color: "#B7825E" },
  { name: "Twist of Fate",         color: "#F472B6" },
] as const;
