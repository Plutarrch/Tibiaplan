/**
 * Weapon Proficiency browser + planner state.
 *
 * Standalone Alpine module. Persists which weapon is selected and which
 * perk the user has picked at each level (their hypothetical build).
 * Selection is per-weapon so switching to a different weapon shows a
 * fresh tree; the last per-weapon build is remembered when the user
 * comes back.
 *
 * The comparator view (multi-weapon side-by-side) will slot in later —
 * this MVP handles single-weapon browsing so users can see and plan
 * one tree at a time first.
 */

import {
  WEAPONS,
  findWeaponById,
  type Perk,
  type Weapon,
  type WeaponCategory,
} from "../data/weaponProficiency";
import {
  findShapeOptionById,
  shapeOptionsFor,
  type ShapeOption,
} from "../data/perkShapingOptions";

const STORAGE_KEY = "tibiaplanner.weaponProficiency";
const RESET_EVENT = "app:reset";

let activeInstance: ReturnType<typeof weaponProficiencyTab> | null = null;
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => activeInstance?.reset());
}

/** A single shape entry, anchored to (level, choiceIndex). Storing the
 *  choiceIndex means the shape "belongs to" one specific perk within a
 *  level — clicking a sibling choice at the same level doesn't inherit
 *  the shape; it just leaves the shape dormant until the anchor choice
 *  is picked again. */
interface ShapeEntry {
  choiceIndex: number;
  shapeId: string;
}

interface PersistedState {
  selectedWeaponId: string;
  /** Filter that persists across sessions. Vocation filter was removed
   *  per owner — category alone is enough to narrow the browser. */
  categoryFilter: string; // "" = All
  /**
   * Per-slot per-weapon picks: `{ weaponId: { level: choiceIndex } }`.
   * choiceIndex is 0-based into the level's `choices` array.
   * Split by slot so the comparator can hold the SAME weapon in both
   * slots with two independent builds (a very common Compare use case:
   * "which perk path is stronger for weapon X?"). Legacy saves used
   * `picksByWeapon` for slot A — a load-time migration copies it into
   * `picksByWeapon` (renamed but same shape) and leaves slot B empty.
   */
  picksByWeapon: Record<string, Record<number, number>>;
  picksByWeaponB: Record<string, Record<number, number>>;

  /**
   * Perk Shaping: swaps applied via the Modify flow. Each weapon can
   * have up to 2 levels replaced. Each entry is tied to a SPECIFIC
   * choice at that level (choiceIndex), so picking a different choice
   * at the same level hides the shape without moving it — the shape
   * stays with the choice it was applied to. Absence = the tree's
   * original perks at that level. Per slot so slot A and slot B can
   * shape the same weapon independently.
   */
  shapedByWeapon: Record<string, Record<number, ShapeEntry>>;
  shapedByWeaponB: Record<string, Record<number, ShapeEntry>>;

  /**
   * LRU history of weaponIds that have picks/shapes stored — most
   * recently touched first. Capped at LRU_LIMIT per slot. When the
   * user modifies a weapon not in the list, it's promoted to the
   * front; if the list overflows, the tail's picks + shapes are
   * evicted so the localStorage payload stays small (matters when
   * users spam-explore many builds — 435 weapons × N picks would
   * bloat quickly).
   */
  pickHistoryA: string[];
  pickHistoryB: string[];

  /**
   * Level check filter — the user's character level. When set, weapons
   * that require a higher level are hidden from BOTH slots' grids.
   * Shared across slots on purpose: one character, one filter — the
   * comparator is browsing what THIS player can equip.
   * null / undefined / 0 = filter off (show everything).
   */
  characterLevel: number | null;

  // ---- Compare mode ----
  // Second slot for the side-by-side comparator. Persisted so refreshing
  // the page keeps whatever comparison the user was set up on.
  compareMode: boolean;
  /** Which of the two slots is currently editable in compare mode.
   *  Non-editable side is visually locked (grayed + pointer-events-none). */
  activeSlot: "A" | "B";
  selectedWeaponIdB: string;
  categoryFilterB: string; // "" = All
}

/** Max shapes any single weapon can hold. Mirrors the in-game rule. */
const SHAPE_LIMIT = 2;

/** All weapon categories present in Tibia's Weapon Proficiency system,
 *  ordered by vocation flow (knight melee → paladin distance → mage
 *  spellcaster → monk). Hard-coded so the filter dropdown is stable
 *  even when the data set hasn't imported that category yet. */
const ALL_CATEGORIES: readonly WeaponCategory[] = [
  "sword",
  "axe",
  "club",
  "bow",
  "crossbow",
  "wand",
  "rod",
  "fist",
];

/** Ordering used when the Category filter is "All" — owner spec:
 *  distance first (bow/crossbow), then knight melee (sword/axe/club),
 *  then casters (rod/wand), then fist last. Anything not in this list
 *  (spellbook, other) sinks to the bottom. */
const CATEGORY_SORT_ORDER: Record<string, number> = {
  bow: 0,
  crossbow: 1,
  sword: 2,
  axe: 3,
  club: 4,
  rod: 5,
  wand: 6,
  fist: 7,
};

function defaults(): PersistedState {
  return {
    selectedWeaponId: "",
    categoryFilter: "",
    picksByWeapon: {},
    picksByWeaponB: {},
    shapedByWeapon: {},
    shapedByWeaponB: {},
    pickHistoryA: [],
    pickHistoryB: [],
    characterLevel: null,
    compareMode: false,
    activeSlot: "A",
    selectedWeaponIdB: "",
    categoryFilterB: "",
  };
}

/** Max number of weapons per slot for which we retain picks + shapes.
 *  Owner call: keep localStorage lean — users spam-explore many
 *  weapons, no need to preserve state for all of them. */
const LRU_LIMIT = 2;

/** Promote a weaponId to the front of the LRU history. If the history
 *  overflows, return the ids to evict (caller deletes their picks +
 *  shapes). Mutates `history` in place; returns evicted ids. */
function promoteInHistory(history: string[], weaponId: string): string[] {
  const idx = history.indexOf(weaponId);
  if (idx >= 0) history.splice(idx, 1);
  history.unshift(weaponId);
  const evicted: string[] = [];
  while (history.length > LRU_LIMIT) {
    const tail = history.pop();
    if (tail) evicted.push(tail);
  }
  return evicted;
}

// ---------------------------------------------------------------------------
// Weapon Summary aggregator — computes the "effective" stats of a weapon
// given the perks the user picked. Powers the summary box under the tree
// and (later) the side-by-side comparator.
//
// Rules the owner set:
//   - Only perks whose text literally reads "+N <stat>" (attack, defence,
//     fighting skill, magic level, specialized magic level) sum to the
//     weapon's base stat. Green highlight + "base + perk" tooltip in the UI.
//   - Everything else (crits, scaling %, leech %, bestiary bonuses,
//     spell augments, on-kill, on-hit, cooldown reductions, perfect shot)
//     lands as a text line in the appropriate section, so it stays
//     readable and situational.
// ---------------------------------------------------------------------------

type StatKey =
  | "attack"
  | "defense"
  | "distanceFighting"
  | "axeFighting"
  | "swordFighting"
  | "clubFighting"
  | "fistFighting"
  | "shielding"
  | "magicLevel"
  | "holyMagicLevel"
  | "iceMagicLevel"
  | "earthMagicLevel"
  | "energyMagicLevel"
  | "fireMagicLevel"
  | "deathMagicLevel"
  | "healingMagicLevel";

export interface StatValue {
  base: number | null;   // null = weapon doesn't have this stat baseline (e.g., no atk on a wand)
  bonus: number;          // sum of perk contributions
  total: number;          // base + bonus (0 when base is null and bonus is 0)
  hasBase: boolean;
  hasBonus: boolean;
}

/** An aggregated line of effect text — same underlying perk-effect
 *  collapsed across multiple picks. Example: 4 different "critical extra
 *  damage" perks (+4/+6/+8/+10) merge into one line "+28% critical extra
 *  damage" with tooltipParts = ["+4%","+6%","+8%","+10%"]. */
export interface AggregatedEffect {
  /** Descriptive text after the numeric part, e.g. "critical extra damage". */
  label: string;
  /** Sign character captured from parsing ("+" / "-"). Empty for raw lines. */
  sign: string;
  /** Unit suffix, one of "%" | "s" | "". */
  unit: string;
  /** Sum of all contributions (0 for raw non-parseable lines). */
  totalValue: number;
  /** The numeric portion alone, e.g. "+28%" — the UI paints this green
   *  (same treatment as the perk-boosted stat rows above) so the reader
   *  spots the total at a glance. Empty string for raw text-only lines. */
  valueDisplay: string;
  /** Rendered single-line display, e.g. "+28% critical extra damage".
   *  Kept for callers that want the whole string; the render on this page
   *  prefers valueDisplay + label so it can color-code the number. */
  display: string;
  /** Individual contributions in pick order, e.g. ["+4%","+6%","+8%","+10%"].
   *  Used as the tooltip when the UI wants to show the breakdown. */
  tooltipParts: string[];
  /** Convenience: tooltipParts.length. UI shows a "(N×)" chip when > 1. */
  count: number;
}

/** Bestiary bonus, collapsed per family. Two perks for "+3% Bird" and
 *  "+5% Bird" merge into { family:"Bird", totalPct:8, count:2 }. */
export interface BestiaryEntry {
  family: string;
  totalPct: number;
  count: number;
  tooltipParts: string[]; // ["+3%","+5%"] in pick order
}

/** Spell augment bucket, grouped by spell then aggregated. */
export interface SpellAugmentBucket {
  spell: string;
  effects: AggregatedEffect[];
}

export interface WeaponSummary {
  weapon: Weapon;
  stats: Record<StatKey, StatValue>;
  /** Weapon-native fields that don't come from perks — shown as-is.
   *  Weight is intentionally excluded (owner call: irrelevant to almost
   *  everyone using the planner). */
  native: {
    range: number | null;
    damageRange: string | null;
    damageType: string | null;
    /** Extra elemental attack layered on top of physical (e.g. Emerald
     *  Sword's "+12 earth" alongside its 49 physical). Rendered inline
     *  with the Attack row when present. */
    extraAttack: number | null;
    extraAttackType: string | null;
    manaCost: number | null;
    critExtraDamage: number | null;
    hpLeech: number | null;
    manaLeech: number | null;
    imbueSlots: number | null;
    duration: string | null;
  };
  bestiary: BestiaryEntry[];
  bonusEffects: AggregatedEffect[];   // catch-all (crit, scaling, boss, perfect shot, on-kill, etc.)
  spellAugments: SpellAugmentBucket[];
}

// ---------------------------------------------------------------------------
// Small helpers for the aggregators below.

/** Format a numeric total for display. Trims trailing zeros so 12 stays "12"
 *  and 12.50 stays "12.5" (Tibia's own descriptions do the same). */
function fmt(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}

/** Parse a "+N% <label>" / "-Ns <label>" / "+N <label>" description into
 *  its numeric parts. Returns null if the string doesn't match the shape
 *  (some perk descriptions are pure text). */
function parseValuedDesc(
  desc: string
): { sign: string; value: number; unit: string; label: string } | null {
  const m = /^([+-])(\d+(?:\.\d+)?)(%|s)?\s+(.+)$/.exec(desc.trim());
  if (!m) return null;
  return {
    sign: m[1],
    value: parseFloat(m[2]),
    unit: m[3] ?? "",
    label: m[4].trim(),
  };
}

/** Accumulator that groups incoming perk-description lines by their
 *  "shape" (sign + unit + label) so duplicates collapse into a single
 *  aggregated row. Unparseable descriptions fall through as raw lines
 *  with count = 1. */
class EffectAggregator {
  private grouped = new Map<
    string,
    { sign: string; unit: string; total: number; parts: string[]; label: string }
  >();
  private raws: string[] = [];

  add(desc: string) {
    const p = parseValuedDesc(desc);
    if (!p) {
      if (desc) this.raws.push(desc);
      return;
    }
    const key = `${p.sign}|${p.unit}|${p.label}`;
    const partStr = `${p.sign}${fmt(p.value)}${p.unit}`;
    const existing = this.grouped.get(key);
    if (existing) {
      existing.total += p.value;
      existing.parts.push(partStr);
    } else {
      this.grouped.set(key, {
        sign: p.sign,
        unit: p.unit,
        total: p.value,
        parts: [partStr],
        label: p.label,
      });
    }
  }

  toArray(): AggregatedEffect[] {
    const merged: AggregatedEffect[] = Array.from(this.grouped.values()).map((e) => {
      const valueDisplay = `${e.sign}${fmt(e.total)}${e.unit}`;
      const count = e.parts.length;
      return {
        label: e.label,
        sign: e.sign,
        unit: e.unit,
        totalValue: e.total,
        valueDisplay,
        display: `${valueDisplay} ${e.label}`,
        // Owner call: tooltip shouldn't leak per-perk amounts — just
        // reference which contributing pick each part came from.
        tooltipParts: Array.from({ length: count }, (_, i) => `Perk ${i + 1}`),
        count,
      };
    });
    const raws: AggregatedEffect[] = this.raws.map((text) => ({
      label: text,
      sign: "",
      unit: "",
      totalValue: 0,
      valueDisplay: "",
      display: text,
      tooltipParts: [text],
      count: 1,
    }));
    return [...merged, ...raws];
  }
}

const ZERO_STAT: StatValue = { base: null, bonus: 0, total: 0, hasBase: false, hasBonus: false };

function emptyStats(): Record<StatKey, StatValue> {
  return {
    attack: { ...ZERO_STAT },
    defense: { ...ZERO_STAT },
    distanceFighting: { ...ZERO_STAT },
    axeFighting: { ...ZERO_STAT },
    swordFighting: { ...ZERO_STAT },
    clubFighting: { ...ZERO_STAT },
    fistFighting: { ...ZERO_STAT },
    shielding: { ...ZERO_STAT },
    magicLevel: { ...ZERO_STAT },
    holyMagicLevel: { ...ZERO_STAT },
    iceMagicLevel: { ...ZERO_STAT },
    earthMagicLevel: { ...ZERO_STAT },
    energyMagicLevel: { ...ZERO_STAT },
    fireMagicLevel: { ...ZERO_STAT },
    deathMagicLevel: { ...ZERO_STAT },
    healingMagicLevel: { ...ZERO_STAT },
  };
}

const SKILL_TO_KEY: Record<string, StatKey> = {
  Distance: "distanceFighting",
  Axe: "axeFighting",
  Sword: "swordFighting",
  Club: "clubFighting",
  Fist: "fistFighting",
  Shielding: "shielding",
};

const ELEMENT_TO_KEY: Record<string, StatKey> = {
  Holy: "holyMagicLevel",
  Ice: "iceMagicLevel",
  Earth: "earthMagicLevel",
  Energy: "energyMagicLevel",
  Fire: "fireMagicLevel",
  Death: "deathMagicLevel",
  Healing: "healingMagicLevel",
};

/** Get the currently-picked perks for a weapon in level order.
 *  Returns tuples of (level, perk) so the caller can check whether
 *  each level has a shape override applied. */
function pickedPerksOf(weapon: Weapon, picks: Record<number, number>): { level: number; perk: Perk }[] {
  const out: { level: number; perk: Perk }[] = [];
  for (const level of weapon.perkTree) {
    const idx = picks[level.level];
    if (typeof idx === "number" && level.choices[idx]) {
      out.push({ level: level.level, perk: level.choices[idx] });
    }
  }
  return out;
}

/** Extract the numeric prefix from a shape option's rank0 description.
 *  TibiaWiki BR uses comma as decimal (e.g. "+2,00%") — we normalize to
 *  a dot so the effect aggregator (which speaks the English format)
 *  can parse it consistently. Returns null when no numeric prefix. */
function shapeValueDisplay(rank0: string): string | null {
  const m = /^([+-])(\d+)(?:[,.](\d+))?(%|s)?/.exec(rank0.trim());
  if (!m) return null;
  const sign = m[1];
  const intPart = m[2];
  const decPart = m[3];
  const unit = m[4] ?? "";
  // Round decimal if present — collapse "2,00" → "2", keep "12,5" as "12.5"
  let valueStr = intPart;
  if (decPart) {
    const trimmed = decPart.replace(/0+$/, "");
    if (trimmed.length > 0) valueStr = `${intPart}.${trimmed}`;
  }
  return `${sign}${valueStr}${unit}`;
}

export function computeWeaponSummary(
  weapon: Weapon,
  picks: Record<number, number>,
  shapes: Record<number, ShapeEntry> = {},
): WeaponSummary {
  const stats = emptyStats();

  // Seed base values from the weapon
  const s = weapon.stats;
  if (s.attack != null)          { stats.attack.base = s.attack;          stats.attack.hasBase = true; }
  if (s.defense != null)         { stats.defense.base = s.defense;         stats.defense.hasBase = true; }
  if (s.distanceFighting != null){ stats.distanceFighting.base = s.distanceFighting; stats.distanceFighting.hasBase = true; }
  if (s.axeFighting != null)     { stats.axeFighting.base = s.axeFighting; stats.axeFighting.hasBase = true; }
  if (s.swordFighting != null)   { stats.swordFighting.base = s.swordFighting; stats.swordFighting.hasBase = true; }
  if (s.clubFighting != null)    { stats.clubFighting.base = s.clubFighting; stats.clubFighting.hasBase = true; }
  if (s.fistFighting != null)    { stats.fistFighting.base = s.fistFighting; stats.fistFighting.hasBase = true; }
  if (s.shielding != null)       { stats.shielding.base = s.shielding; stats.shielding.hasBase = true; }
  if (s.magicLevel != null)      { stats.magicLevel.base = s.magicLevel; stats.magicLevel.hasBase = true; }
  if (s.holyMagicLevel != null)  { stats.holyMagicLevel.base = s.holyMagicLevel; stats.holyMagicLevel.hasBase = true; }
  if (s.iceMagicLevel != null)   { stats.iceMagicLevel.base = s.iceMagicLevel; stats.iceMagicLevel.hasBase = true; }
  if (s.earthMagicLevel != null) { stats.earthMagicLevel.base = s.earthMagicLevel; stats.earthMagicLevel.hasBase = true; }
  if (s.energyMagicLevel != null){ stats.energyMagicLevel.base = s.energyMagicLevel; stats.energyMagicLevel.hasBase = true; }
  if (s.fireMagicLevel != null)  { stats.fireMagicLevel.base = s.fireMagicLevel; stats.fireMagicLevel.hasBase = true; }
  if (s.deathMagicLevel != null) { stats.deathMagicLevel.base = s.deathMagicLevel; stats.deathMagicLevel.hasBase = true; }
  if (s.healingMagicLevel != null){ stats.healingMagicLevel.base = s.healingMagicLevel; stats.healingMagicLevel.hasBase = true; }

  // Bestiary collapses per creature family; two "+3% Bird" + "+5% Bird"
  // picks become one { family:"Bird", totalPct:8, count:2 } row.
  const bestiaryMap = new Map<string, { total: number; parts: string[] }>();

  // Generic bonus effects: consolidate matching descriptions (e.g., four
  // separate "critical extra damage" perks collapse into one row with
  // the summed % and a tooltip listing each contribution).
  const bonusAgg = new EffectAggregator();

  // Spell augments: one aggregator per spell (so "life leech for Divine
  // Caldera" is separate from "life leech for Divine Missile", but two
  // picks of "life leech for Divine Caldera" do collapse together).
  const augmentAggBySpell = new Map<string, EffectAggregator>();

  for (const { level, perk } of pickedPerksOf(weapon, picks)) {
    // Shape override: only apply the shape if the currently picked
    // choice at this level is the shape's anchor choice. A shape tied
    // to a sibling choice is dormant and shouldn't contribute stats.
    // Owner call: the planner always assumes rank 10 (max) — that's
    // what end-game players will land on, so summary numbers reflect
    // the fully-leveled build.
    const shapeEntry = shapes[level];
    if (shapeEntry && shapeEntry.choiceIndex === picks[level]) {
      const shape = findShapeOptionById(shapeEntry.shapeId);
      if (shape) {
        const valueDisplay = shapeValueDisplay(shape.rank10);
        bonusAgg.add(valueDisplay ? `${valueDisplay} ${shape.name}` : shape.name);
        continue;
      }
    }
    const name = perk.name;
    const desc = perk.description ?? "";

    // --- Direct stat sums (green highlight in UI) ---

    if (name === "Attack damage") {
      const m = /^\+(\d+)\s+attack/i.exec(desc);
      if (m) { stats.attack.bonus += parseInt(m[1], 10); continue; }
    }

    if (name === "Defence" || name === "Weapon shield") {
      // "+1 defence" or "+1 defence modifier"
      const m = /^\+(\d+)\s+defence/i.exec(desc);
      if (m) { stats.defense.bonus += parseInt(m[1], 10); continue; }
    }

    if (name === "Combat skill") {
      // "+1 Distance Fighting" | "+1 Axe Fighting" | "+1 Magic Level"
      const skill = /^\+(\d+)\s+(Distance|Axe|Sword|Club|Fist|Shielding)\s+Fighting/i.exec(desc);
      if (skill) {
        const key = SKILL_TO_KEY[skill[2]];
        if (key) { stats[key].bonus += parseInt(skill[1], 10); continue; }
      }
      const ml = /^\+(\d+)\s+Magic Level/i.exec(desc);
      if (ml) { stats.magicLevel.bonus += parseInt(ml[1], 10); continue; }
    }

    if (name === "Specialized magic level") {
      // "+1 Holy Magic Level" / "+2 Earth Magic Level" / "+3 Healing Magic Level"
      const m = /^\+(\d+)\s+(Fire|Ice|Earth|Energy|Death|Holy|Healing)\s+Magic Level/i.exec(desc);
      if (m) {
        const key = ELEMENT_TO_KEY[m[2]];
        if (key) { stats[key].bonus += parseInt(m[1], 10); continue; }
      }
    }

    // --- Categorized text lines ---

    if (name === "Damage against bestiary family") {
      // "+3% damage against Bird"
      const m = /^\+([\d.]+)%\s+damage against\s+(\w+)/i.exec(desc);
      if (m) {
        const family = m[2];
        const pct = parseFloat(m[1]);
        const partStr = `+${m[1]}%`;
        const bucket = bestiaryMap.get(family);
        if (bucket) {
          bucket.total += pct;
          bucket.parts.push(partStr);
        } else {
          bestiaryMap.set(family, { total: pct, parts: [partStr] });
        }
        continue;
      }
    }

    if (name === "Spell augmentation") {
      // "+5% life leech for Divine Caldera"  OR  "-2s cooldown for Front Sweep"
      // OR "+6% healing for Heal Friend"
      const forMatch = /^(.+?)\s+for\s+([\w'’ ]+)$/i.exec(desc.trim());
      if (forMatch) {
        const effect = forMatch[1].trim();
        const spell = forMatch[2].trim();
        let agg = augmentAggBySpell.get(spell);
        if (!agg) {
          agg = new EffectAggregator();
          augmentAggBySpell.set(spell, agg);
        }
        agg.add(effect);
        continue;
      }
    }

    // Everything else → generic bonus line (crit, scaling, boss/sinister,
    // perfect shot, mana leech %, on-kill, on-hit, cooldowns, etc.)
    if (desc) bonusAgg.add(desc);
  }

  // Finalize totals + hasBonus
  for (const key of Object.keys(stats) as StatKey[]) {
    const v = stats[key];
    v.hasBonus = v.bonus > 0;
    v.total = (v.base ?? 0) + v.bonus;
  }

  const bestiary: BestiaryEntry[] = Array.from(bestiaryMap.entries()).map(([family, data]) => {
    const count = data.parts.length;
    return {
      family,
      totalPct: data.total,
      count,
      // Same convention as EffectAggregator: numbered references only,
      // no per-perk amounts in the tooltip.
      tooltipParts: Array.from({ length: count }, (_, i) => `Perk ${i + 1}`),
    };
  });

  const spellAugments: SpellAugmentBucket[] = Array.from(augmentAggBySpell.entries()).map(
    ([spell, agg]) => ({ spell, effects: agg.toArray() })
  );

  return {
    weapon,
    stats,
    native: {
      range: s.range ?? null,
      damageRange: s.damageRange ?? null,
      damageType: s.damageType ?? null,
      extraAttack: s.extraAttack ?? null,
      extraAttackType: s.extraAttackType ?? null,
      manaCost: s.manaCost ?? null,
      critExtraDamage: s.critExtraDamage ?? null,
      hpLeech: s.hpLeech ?? null,
      manaLeech: s.manaLeech ?? null,
      imbueSlots: s.imbueSlots ?? null,
      duration: s.duration ?? null,
    },
    bestiary,
    bonusEffects: bonusAgg.toArray(),
    spellAugments,
  };
}

export function weaponProficiencyTab() {
  return {
    ...defaults(),

    // Ephemeral search strings — not persisted, reset between visits so
    // each box always starts empty and the user isn't stuck on a filter
    // they forgot about. Separate query per slot so filtering slot B
    // doesn't jump slot A's grid around.
    searchQuery: "",
    searchQueryB: "",

    // Ephemeral: which level's picked perk is currently "focused" (the
    // one Shape/Restore act on). Per slot so both slots track focus
    // independently in compare mode. `null` = nothing focused.
    focusedLevel: null as number | null,
    focusedLevelB: null as number | null,

    // Ephemeral: which slot the Shape modal is currently open for.
    // `null` = modal closed. Also holds the level being shaped so the
    // modal knows which slot to write to.
    shapeModalSlot: null as "A" | "B" | null,
    shapeModalLevel: null as number | null,
    shapeModalSelectedId: "" as string,
    shapeModalSearch: "",

    // Ephemeral: pulses on for ~1.5s after Share is clicked so the
    // button can flash "Copied!". Kept out of persistence — it's a
    // transient UI hint, not user state.
    shareCopied: false,

    // Static data for templates
    ALL_WEAPONS: WEAPONS,

    init() {
      installBus();
      activeInstance = this;
      this.load();
      // Consume ?share=... in the URL BEFORE the default-weapon fallback
      // so a shared URL fully hydrates state (and the URL stays clean
      // after — the hash is stripped once applied).
      this._readShareFromUrl();
      // Default to the first weapon so the page isn't blank on first visit.
      if (!this.selectedWeaponId && this.filteredWeapons.length > 0) {
        this.selectedWeaponId = this.filteredWeapons[0].id;
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          Object.assign(this, defaults(), data);
          // Legacy shape migration: earlier the shape map was
          //   Record<weaponId, Record<level, shapeId(string)>>
          // then we anchored shapes to a specific choice:
          //   Record<weaponId, Record<level, { choiceIndex, shapeId }>>
          // Convert any legacy string entries by inferring choiceIndex
          // from the current pick at that level (fallback to 0).
          this.picksByWeapon = this.picksByWeapon ?? {};
          this.picksByWeaponB = this.picksByWeaponB ?? {};
          const migrate = (
            shaped: Record<string, Record<number, unknown>>,
            picks: Record<string, Record<number, number>>,
          ) => {
            for (const [weaponId, levels] of Object.entries(shaped)) {
              for (const [levelStr, entry] of Object.entries(levels)) {
                if (typeof entry === "string") {
                  const level = Number(levelStr);
                  const choiceIndex = picks[weaponId]?.[level] ?? 0;
                  (levels as Record<number, ShapeEntry>)[level] = { choiceIndex, shapeId: entry };
                }
              }
            }
          };
          migrate(this.shapedByWeapon as any, this.picksByWeapon);
          migrate(this.shapedByWeaponB as any, this.picksByWeaponB);

          // LRU seed for pre-LRU saves: if the history is empty but there
          // are picks/shapes present, seed history from those keys and
          // enforce the limit — evicting extras keeps localStorage lean
          // from load onwards. Deterministic order (union of pick keys
          // then shape keys) since we can't know true recency for legacy
          // state.
          const seed = (
            history: string[],
            picks: Record<string, Record<number, number>>,
            shapes: Record<string, Record<number, ShapeEntry>>,
          ): string[] => {
            if (history.length > 0) return history;
            const ids: string[] = [];
            const seen = new Set<string>();
            for (const id of [...Object.keys(picks), ...Object.keys(shapes)]) {
              if (seen.has(id)) continue;
              seen.add(id);
              ids.push(id);
            }
            return ids;
          };
          this.pickHistoryA = seed(this.pickHistoryA ?? [], this.picksByWeapon, this.shapedByWeapon);
          this.pickHistoryB = seed(this.pickHistoryB ?? [], this.picksByWeaponB, this.shapedByWeaponB);
          // Enforce LRU_LIMIT on load — drop anything past the tail
          // along with its picks + shapes.
          const enforceLimit = (
            history: string[],
            picksKey: "picksByWeapon" | "picksByWeaponB",
            shapesKey: "shapedByWeapon" | "shapedByWeaponB",
          ) => {
            if (history.length <= LRU_LIMIT) return;
            const evicted = history.splice(LRU_LIMIT);
            if (evicted.length === 0) return;
            const picks = { ...(this[picksKey] as Record<string, Record<number, number>>) };
            const shapes = { ...(this[shapesKey] as Record<string, Record<number, ShapeEntry>>) };
            for (const id of evicted) {
              delete picks[id];
              delete shapes[id];
            }
            this[picksKey] = picks as any;
            this[shapesKey] = shapes as any;
          };
          enforceLimit(this.pickHistoryA, "picksByWeapon", "shapedByWeapon");
          enforceLimit(this.pickHistoryB, "picksByWeaponB", "shapedByWeaponB");
        }
      } catch {
        // ignore
      }
    },

    save() {
      const snapshot: PersistedState = {
        selectedWeaponId: this.selectedWeaponId,
        categoryFilter: this.categoryFilter,
        picksByWeapon: this.picksByWeapon,
        picksByWeaponB: this.picksByWeaponB,
        shapedByWeapon: this.shapedByWeapon,
        shapedByWeaponB: this.shapedByWeaponB,
        pickHistoryA: this.pickHistoryA,
        pickHistoryB: this.pickHistoryB,
        characterLevel: this.characterLevel,
        compareMode: this.compareMode,
        activeSlot: this.activeSlot,
        selectedWeaponIdB: this.selectedWeaponIdB,
        categoryFilterB: this.categoryFilterB,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    reset() {
      Object.assign(this, defaults());
      this.save();
    },

    // ---- Computed ----

    get selectedWeapon(): Weapon | null {
      return findWeaponById(this.selectedWeaponId);
    },

    get filteredWeapons(): readonly Weapon[] {
      const q = this.searchQuery.trim().toLowerCase();
      const lvl = this.characterLevel;
      const filtered = WEAPONS.filter((w) => {
        if (this.categoryFilter && w.category !== this.categoryFilter) return false;
        if (q && !w.name.toLowerCase().includes(q)) return false;
        if (lvl != null && lvl > 0 && w.levelRequirement != null && w.levelRequirement > lvl) return false;
        return true;
      });
      // Sort by category order (owner spec), then by levelRequirement
      // DESC within each (highest-req first, level-0/undefined last).
      // Name is a tiebreaker when two weapons share the same level.
      // Unknown categories sink to the bottom via the ?? 99 fallback.
      return [...filtered].sort((a, b) => {
        const orderDiff =
          (CATEGORY_SORT_ORDER[a.category] ?? 99) -
          (CATEGORY_SORT_ORDER[b.category] ?? 99);
        if (orderDiff !== 0) return orderDiff;
        const lvlDiff = (b.levelRequirement ?? 0) - (a.levelRequirement ?? 0);
        if (lvlDiff !== 0) return lvlDiff;
        return a.name.localeCompare(b.name);
      });
    },

    /** How many weapons match the current category + search but are
     *  being hidden by the Level filter. Powers the "N hidden by Lvl"
     *  hint next to the counter — otherwise a search that returns 1
     *  result looks broken when the user is actually just under-leveled
     *  for the other matches. Returns 0 when the level filter is off. */
    get hiddenByLevelCountA(): number {
      const lvl = this.characterLevel;
      if (lvl == null || lvl <= 0) return 0;
      const q = this.searchQuery.trim().toLowerCase();
      let hidden = 0;
      for (const w of WEAPONS) {
        if (this.categoryFilter && w.category !== this.categoryFilter) continue;
        if (q && !w.name.toLowerCase().includes(q)) continue;
        if (w.levelRequirement != null && w.levelRequirement > lvl) hidden++;
      }
      return hidden;
    },
    get hiddenByLevelCountB(): number {
      const lvl = this.characterLevel;
      if (lvl == null || lvl <= 0) return 0;
      const q = this.searchQueryB.trim().toLowerCase();
      let hidden = 0;
      for (const w of WEAPONS) {
        if (this.categoryFilterB && w.category !== this.categoryFilterB) continue;
        if (q && !w.name.toLowerCase().includes(q)) continue;
        if (w.levelRequirement != null && w.levelRequirement > lvl) hidden++;
      }
      return hidden;
    },

    /** Full weapon-category list — stable regardless of what's currently
     *  imported, so the filter is complete from day one. */
    get availableCategories(): readonly WeaponCategory[] {
      return ALL_CATEGORIES;
    },

    /** Effective build summary for the current weapon + current perks
     *  + any shapes applied on slot A. Feeds the summary box under
     *  the tree (and the comparator's left half). */
    get weaponSummary(): WeaponSummary | null {
      const w = this.selectedWeapon;
      if (!w) return null;
      const picks = this.picksByWeapon[this.selectedWeaponId] ?? {};
      const shapes = this.shapedByWeapon[this.selectedWeaponId] ?? {};
      return computeWeaponSummary(w, picks, shapes);
    },

    // ---- Compare mode: parallel slot B state + lock helpers ----

    /** Weapon shown in slot B (only rendered when compareMode). */
    get selectedWeaponB(): Weapon | null {
      return findWeaponById(this.selectedWeaponIdB);
    },

    get weaponSummaryB(): WeaponSummary | null {
      const w = this.selectedWeaponB;
      if (!w) return null;
      const picks = this.picksByWeaponB[this.selectedWeaponIdB] ?? {};
      const shapes = this.shapedByWeaponB[this.selectedWeaponIdB] ?? {};
      return computeWeaponSummary(w, picks, shapes);
    },

    get filteredWeaponsB(): readonly Weapon[] {
      const q = this.searchQueryB.trim().toLowerCase();
      const lvl = this.characterLevel;
      const filtered = WEAPONS.filter((w) => {
        if (this.categoryFilterB && w.category !== this.categoryFilterB) return false;
        if (q && !w.name.toLowerCase().includes(q)) return false;
        if (lvl != null && lvl > 0 && w.levelRequirement != null && w.levelRequirement > lvl) return false;
        return true;
      });
      return [...filtered].sort((a, b) => {
        const orderDiff =
          (CATEGORY_SORT_ORDER[a.category] ?? 99) -
          (CATEGORY_SORT_ORDER[b.category] ?? 99);
        if (orderDiff !== 0) return orderDiff;
        const lvlDiff = (b.levelRequirement ?? 0) - (a.levelRequirement ?? 0);
        if (lvlDiff !== 0) return lvlDiff;
        return a.name.localeCompare(b.name);
      });
    },

    /** In compare mode, exactly one slot is editable at a time. The
     *  other row grays out + freezes clicks so the user can't
     *  accidentally overwrite the build they're comparing against. */
    get isSlotALocked(): boolean {
      return this.compareMode && this.activeSlot === "B";
    },
    get isSlotBLocked(): boolean {
      return this.compareMode && this.activeSlot === "A";
    },

    // ---- Mutations ----

    selectWeapon(id: string) {
      this.selectedWeaponId = id;
      // Focus is per-weapon-view; clear it on switch so Shape
      // doesn't operate on a stale level from a previous weapon.
      this.focusedLevel = null;
      this.save();
    },

    setCategoryFilter(cat: string) {
      this.categoryFilter = cat;
      // If the currently-selected weapon no longer matches the filter,
      // switch to the first weapon that does (or blank it out).
      if (this.selectedWeapon && this.categoryFilter && this.selectedWeapon.category !== this.categoryFilter) {
        this.selectedWeaponId = this.filteredWeapons[0]?.id ?? "";
      }
      this.save();
    },

    /** Called by the Category `<select>` in either ARSENAL (uses
     *  `x-model` for the two-way sync, then fires this to run the
     *  side-effects that x-model can't). Handles both slots via a
     *  single entry point so future filter tweaks stay in one place. */
    onCategoryFilterChange(slot: "A" | "B") {
      if (slot === "A") {
        if (this.selectedWeapon && this.categoryFilter && this.selectedWeapon.category !== this.categoryFilter) {
          this.selectedWeaponId = this.filteredWeapons[0]?.id ?? "";
        }
      } else {
        if (this.selectedWeaponB && this.categoryFilterB && this.selectedWeaponB.category !== this.categoryFilterB) {
          this.selectedWeaponIdB = this.filteredWeaponsB[0]?.id ?? "";
        }
      }
      // Reset the grid scroll — landing halfway down after a category
      // switch is disorienting; the new first item should be visible.
      this._scrollWeaponsList(slot);
      this.save();
    },

    /** Snap the weapons grid back to the top. Runs on $nextTick so the
     *  x-for re-render finishes before we reset scrollTop (otherwise
     *  Alpine can restore scroll from the previous render). Silent
     *  no-op if the ref hasn't mounted yet (e.g. compare mode is off
     *  and slot B's ref doesn't exist). */
    _scrollWeaponsList(slot: "A" | "B") {
      const refKey = slot === "A" ? "weaponsListA" : "weaponsListB";
      this.$nextTick(() => {
        const el = this.$refs?.[refKey] as HTMLElement | undefined;
        if (el) el.scrollTop = 0;
      });
    },

    /** Commit a level-check input. Parses to int; clamps invalid /
     *  non-positive values to null (filter off). Called on `@input` so
     *  the grid narrows as the user types — feels responsive because
     *  the filter is client-side and cheap. */
    setCharacterLevel(raw: string | number | null | undefined) {
      if (raw == null || raw === "") {
        this.characterLevel = null;
      } else {
        const n = typeof raw === "number" ? raw : parseInt(String(raw).trim(), 10);
        this.characterLevel = Number.isFinite(n) && n > 0 ? n : null;
      }
      // If the current selection no longer passes the filter, drop to
      // the first weapon that still matches (avoids showing an empty
      // tree for a weapon the user can't equip anyway).
      const w = this.selectedWeapon;
      if (
        w && this.characterLevel != null && w.levelRequirement != null &&
        w.levelRequirement > this.characterLevel
      ) {
        this.selectedWeaponId = this.filteredWeapons[0]?.id ?? "";
      }
      if (this.compareMode) {
        const wb = this.selectedWeaponB;
        if (
          wb && this.characterLevel != null && wb.levelRequirement != null &&
          wb.levelRequirement > this.characterLevel
        ) {
          this.selectedWeaponIdB = this.filteredWeaponsB[0]?.id ?? "";
        }
      }
      // Filter changes the visible set — snap both grids back to top
      // so the user isn't stranded partway down a shorter list.
      this._scrollWeaponsList("A");
      if (this.compareMode) this._scrollWeaponsList("B");
      this.save();
    },

    setSearchQuery(q: string) {
      this.searchQuery = q;
      // Search is ephemeral — don't touch localStorage. Just narrow the
      // list; keep the current selection even if it filters out (user
      // may want to clear the search and return to it).
    },

    // ---- Compare mode: mutations for slot B + toggle ----

    selectWeaponB(id: string) {
      this.selectedWeaponIdB = id;
      this.focusedLevelB = null;
      this.save();
    },

    setCategoryFilterB(cat: string) {
      this.categoryFilterB = cat;
      if (this.selectedWeaponB && this.categoryFilterB && this.selectedWeaponB.category !== this.categoryFilterB) {
        this.selectedWeaponIdB = this.filteredWeaponsB[0]?.id ?? "";
      }
      this.save();
    },

    setSearchQueryB(q: string) {
      this.searchQueryB = q;
    },

    /** Enter compare mode. Slot B starts editable so the user can
     *  immediately pick the second weapon; slot A locks. */
    enterCompare() {
      this.compareMode = true;
      this.activeSlot = "B";
      this.save();
    },

    /** Exit compare mode entirely. Slot B state is preserved in
     *  localStorage so re-entering compare picks up where they left
     *  off — nothing is more annoying than losing a comparison build
     *  because you closed the second panel to peek at something. */
    exitCompare() {
      this.compareMode = false;
      this.activeSlot = "A";
      this.save();
    },

    /** Swap which slot is active. Called by the Back button on
     *  whichever row is currently locked. */
    switchToSlot(slot: "A" | "B") {
      this.activeSlot = slot;
      this.save();
    },

    /** Toggle a perk pick at a given level for slot A. Passing the
     *  same index again clears the pick (allows "un-pick" without a
     *  second UI). Slot B has its own togglePerkB below so the two
     *  slots can hold independent builds — even of the SAME weapon. */
    togglePerk(weaponId: string, level: number, choiceIndex: number) {
      const current = this.picksByWeapon[weaponId] ?? {};
      const wasPicked = current[level] === choiceIndex;
      // Rule (owner call): clicking the currently picked SHAPED choice
      // must NOT unpick it — that removed the shape from view and
      // confused users. Just focus so Restore lights up.
      const shapeChoiceIdx = this.shapedByWeapon[weaponId]?.[level]?.choiceIndex ?? -1;
      const clickingShapedPick = wasPicked && shapeChoiceIdx === choiceIndex;
      if (clickingShapedPick) {
        this.focusedLevel = level;
        this.save();
        return;
      }
      const next = { ...current };
      if (wasPicked) {
        delete next[level];
      } else {
        next[level] = choiceIndex;
      }
      this.picksByWeapon = {
        ...this.picksByWeapon,
        [weaponId]: next,
      };
      this._touchWeaponA(weaponId);
      // Any click on a perk focuses its level for the Shape action.
      this.focusedLevel = level;
      this.save();
    },

    /** Which choice (0..n-1) is picked at this level for the current
     *  weapon on slot A, or -1 if nothing picked yet. */
    getPick(weaponId: string, level: number): number {
      const picks = this.picksByWeapon[weaponId];
      if (!picks) return -1;
      const v = picks[level];
      return typeof v === "number" ? v : -1;
    },

    /** How many levels the user has committed a perk on for slot A
     *  (feeds the "Picked X/Y" badge). */
    getPickedCount(weaponId: string): number {
      const picks = this.picksByWeapon[weaponId];
      if (!picks) return 0;
      return Object.keys(picks).length;
    },

    // ---- Slot B mirrors: identical logic but backed by picksByWeaponB
    // so slot B's picks stay independent from slot A's, even when both
    // slots point at the same weapon id. ----

    togglePerkB(weaponId: string, level: number, choiceIndex: number) {
      const current = this.picksByWeaponB[weaponId] ?? {};
      const wasPicked = current[level] === choiceIndex;
      const shapeChoiceIdx = this.shapedByWeaponB[weaponId]?.[level]?.choiceIndex ?? -1;
      const clickingShapedPick = wasPicked && shapeChoiceIdx === choiceIndex;
      if (clickingShapedPick) {
        this.focusedLevelB = level;
        this.save();
        return;
      }
      const next = { ...current };
      if (wasPicked) {
        delete next[level];
      } else {
        next[level] = choiceIndex;
      }
      this.picksByWeaponB = {
        ...this.picksByWeaponB,
        [weaponId]: next,
      };
      this._touchWeaponB(weaponId);
      this.focusedLevelB = level;
      this.save();
    },

    /** LRU housekeeping — promote weaponId to front of pickHistoryA
     *  and evict picks + shapes for any weapons that fall off the tail
     *  (past LRU_LIMIT). Called by any mutation that adds/updates
     *  slot-A state for a specific weapon. */
    _touchWeaponA(weaponId: string) {
      const evicted = promoteInHistory(this.pickHistoryA, weaponId);
      if (evicted.length === 0) return;
      const picks = { ...this.picksByWeapon };
      const shapes = { ...this.shapedByWeapon };
      for (const id of evicted) {
        delete picks[id];
        delete shapes[id];
      }
      this.picksByWeapon = picks;
      this.shapedByWeapon = shapes;
    },
    _touchWeaponB(weaponId: string) {
      const evicted = promoteInHistory(this.pickHistoryB, weaponId);
      if (evicted.length === 0) return;
      const picks = { ...this.picksByWeaponB };
      const shapes = { ...this.shapedByWeaponB };
      for (const id of evicted) {
        delete picks[id];
        delete shapes[id];
      }
      this.picksByWeaponB = picks;
      this.shapedByWeaponB = shapes;
    },

    getPickB(weaponId: string, level: number): number {
      const picks = this.picksByWeaponB[weaponId];
      if (!picks) return -1;
      const v = picks[level];
      return typeof v === "number" ? v : -1;
    },

    getPickedCountB(weaponId: string): number {
      const picks = this.picksByWeaponB[weaponId];
      if (!picks) return 0;
      return Object.keys(picks).length;
    },

    // ---- Perk Shaping ------------------------------------------------

    /** Focus a level in slot A. Sets the "which perk is Shape acting
     *  on" cursor. Passing the same level again clears focus.
     *  Auto-called on pick so the user rarely needs an extra click. */
    focusLevel(level: number) {
      this.focusedLevel = this.focusedLevel === level ? null : level;
    },
    focusLevelB(level: number) {
      this.focusedLevelB = this.focusedLevelB === level ? null : level;
    },

    /** Returns the shape option applied at a given weapon+level, or
     *  null. Note: this returns the shape metadata even if the anchor
     *  choice is not currently picked (the shape is dormant then).
     *  Use `getShapedForPick` when rendering choices in the tree. */
    getShaped(weaponId: string, level: number): ShapeOption | null {
      const entry = this.shapedByWeapon[weaponId]?.[level];
      return entry ? findShapeOptionById(entry.shapeId) : null;
    },
    getShapedB(weaponId: string, level: number): ShapeOption | null {
      const entry = this.shapedByWeaponB[weaponId]?.[level];
      return entry ? findShapeOptionById(entry.shapeId) : null;
    },

    /** Returns the shape option that applies to a specific choice at a
     *  level — only truthy when the shape is anchored to this choiceIndex.
     *  This is what the tree render uses to decide whether to swap
     *  icons for a given perk square. */
    getShapedForPick(weaponId: string, level: number, choiceIndex: number): ShapeOption | null {
      const entry = this.shapedByWeapon[weaponId]?.[level];
      if (!entry || entry.choiceIndex !== choiceIndex) return null;
      return findShapeOptionById(entry.shapeId);
    },
    getShapedForPickB(weaponId: string, level: number, choiceIndex: number): ShapeOption | null {
      const entry = this.shapedByWeaponB[weaponId]?.[level];
      if (!entry || entry.choiceIndex !== choiceIndex) return null;
      return findShapeOptionById(entry.shapeId);
    },

    /** Anchor choice index for the shape at (level), or -1 if no shape. */
    getShapedChoiceIndex(weaponId: string, level: number): number {
      return this.shapedByWeapon[weaponId]?.[level]?.choiceIndex ?? -1;
    },
    getShapedChoiceIndexB(weaponId: string, level: number): number {
      return this.shapedByWeaponB[weaponId]?.[level]?.choiceIndex ?? -1;
    },

    /** How many levels of this weapon have been shaped (0-2). Fuels
     *  the "Shapes N/2" counter and the disabled state on Shape button. */
    getShapedCount(weaponId: string): number {
      return Object.keys(this.shapedByWeapon[weaponId] ?? {}).length;
    },
    getShapedCountB(weaponId: string): number {
      return Object.keys(this.shapedByWeaponB[weaponId] ?? {}).length;
    },

    /** True if the user can still apply a NEW shape on this weapon
     *  at the focused level. Replacing an existing shape at a level
     *  already shaped doesn't count against the limit. */
    canShapeAt(weaponId: string, level: number, slot: "A" | "B"): boolean {
      const shaped = slot === "A" ? this.shapedByWeapon : this.shapedByWeaponB;
      const map = shaped[weaponId] ?? {};
      if (level in map) return true; // replacing an existing shape, allowed
      return Object.keys(map).length < SHAPE_LIMIT;
    },

    /** Open the Shape picker modal for the given slot's focused level.
     *  Requires a picked choice at the focused level — the shape anchors
     *  to that specific choice, so a level with nothing picked can't
     *  be shaped. */
    openShapeModal(slot: "A" | "B") {
      const level = slot === "A" ? this.focusedLevel : this.focusedLevelB;
      if (level == null) return;
      const weaponId = slot === "A" ? this.selectedWeaponId : this.selectedWeaponIdB;
      if (!weaponId) return;
      const pick = slot === "A" ? this.getPick(weaponId, level) : this.getPickB(weaponId, level);
      if (pick < 0) return; // must have picked a choice to shape it
      if (!this.canShapeAt(weaponId, level, slot)) return;
      this.shapeModalSlot = slot;
      this.shapeModalLevel = level;
      // Preselect the current shape (if any) so opening → Swap becomes
      // a no-op; if the user is replacing, the current selection shows
      // as the starting point.
      const shaped = slot === "A" ? this.shapedByWeapon : this.shapedByWeaponB;
      this.shapeModalSelectedId = shaped[weaponId]?.[level]?.shapeId ?? "";
      this.shapeModalSearch = "";
    },

    closeShapeModal() {
      this.shapeModalSlot = null;
      this.shapeModalLevel = null;
      this.shapeModalSelectedId = "";
      this.shapeModalSearch = "";
    },

    /** Confirm the shape swap from the modal. Shape anchors to the
     *  choice currently picked at the focused level. */
    applyShapeSelection() {
      const slot = this.shapeModalSlot;
      const level = this.shapeModalLevel;
      const shapeId = this.shapeModalSelectedId;
      if (slot == null || level == null || !shapeId) return;
      const weaponId = slot === "A" ? this.selectedWeaponId : this.selectedWeaponIdB;
      if (!weaponId) return;
      const choiceIndex = slot === "A" ? this.getPick(weaponId, level) : this.getPickB(weaponId, level);
      if (choiceIndex < 0) return;
      const mapKey = slot === "A" ? "shapedByWeapon" : "shapedByWeaponB";
      const existing = { ...(this[mapKey][weaponId] ?? {}) };
      existing[level] = { choiceIndex, shapeId };
      this[mapKey] = { ...this[mapKey], [weaponId]: existing };
      // Applying a shape counts as recent activity on this weapon —
      // update the LRU so it doesn't get evicted before the picks
      // that anchor it.
      if (slot === "A") this._touchWeaponA(weaponId);
      else this._touchWeaponB(weaponId);
      this.closeShapeModal();
      this.save();
    },

    // ---- Share URL ---------------------------------------------------
    //
    // The share button copies a URL that fully hydrates whatever the
    // sharer is currently looking at: selected weapon + picks + shapes
    // for slot A, plus (when compare mode is on) the same for slot B.
    // Encoding is URL-safe base64 of a minimal JSON payload — short
    // enough to fit in DMs/Discord, and self-contained so the receiver
    // doesn't need any pre-existing localStorage state.

    /** Build the minimal share payload. Keys kept short (w/p/s/wb/pb/sb/c)
     *  so the encoded URL stays compact. Only includes slot B fields
     *  when compareMode is on. */
    _buildSharePayload(): Record<string, unknown> {
      const payload: Record<string, unknown> = {
        w: this.selectedWeaponId,
        p: this.picksByWeapon[this.selectedWeaponId] ?? {},
        s: this.shapedByWeapon[this.selectedWeaponId] ?? {},
      };
      if (this.compareMode) {
        payload.c = 1;
        payload.wb = this.selectedWeaponIdB;
        payload.pb = this.picksByWeaponB[this.selectedWeaponIdB] ?? {};
        payload.sb = this.shapedByWeaponB[this.selectedWeaponIdB] ?? {};
      }
      return payload;
    },

    /** URL-safe base64 encode. Strips padding for shorter URLs. */
    _b64UrlEncode(s: string): string {
      const b64 = typeof btoa !== "undefined"
        ? btoa(unescape(encodeURIComponent(s)))
        : Buffer.from(s, "utf-8").toString("base64");
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    },

    /** Inverse of `_b64UrlEncode`. Restores padding + charset before
     *  decoding. Throws (caller catches) on malformed input. */
    _b64UrlDecode(s: string): string {
      const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
      const bin = typeof atob !== "undefined"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("binary");
      try {
        return decodeURIComponent(escape(bin));
      } catch {
        return bin;
      }
    },

    /** Full shareable URL for the current view. Uses the hash fragment
     *  so the server never sees the payload (private links stay client-
     *  side) and analytics don't record each share as its own pageview. */
    getShareUrl(): string {
      if (typeof window === "undefined") return "";
      const payload = this._buildSharePayload();
      const enc = this._b64UrlEncode(JSON.stringify(payload));
      const { origin, pathname } = window.location;
      return `${origin}${pathname}#share=${enc}`;
    },

    /** Copy the share URL to the clipboard and flash the button. Falls
     *  back to a temporary textarea + document.execCommand when the
     *  Clipboard API isn't available (older Safari, insecure contexts). */
    async copyShareUrl() {
      const url = this.getShareUrl();
      if (!url) return;
      let ok = false;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          ok = true;
        }
      } catch {
        ok = false;
      }
      if (!ok && typeof document !== "undefined") {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand("copy"); } catch { ok = false; }
        document.body.removeChild(ta);
      }
      if (ok) {
        this.shareCopied = true;
        setTimeout(() => { this.shareCopied = false; }, 1500);
      }
    },

    /** Read `#share=...` on init and hydrate. Strips the hash after
     *  applying so a page refresh doesn't re-apply an outdated snapshot
     *  over any local edits the receiver made. */
    _readShareFromUrl() {
      if (typeof window === "undefined") return;
      const hash = window.location.hash ?? "";
      const m = /^#share=(.+)$/.exec(hash);
      if (!m) return;
      try {
        const json = this._b64UrlDecode(m[1]);
        const data = JSON.parse(json);
        if (!data || typeof data !== "object") return;
        // Slot A
        if (typeof data.w === "string" && data.w) {
          this.selectedWeaponId = data.w;
          if (data.p && typeof data.p === "object") {
            this.picksByWeapon = { ...this.picksByWeapon, [data.w]: data.p };
          }
          if (data.s && typeof data.s === "object") {
            this.shapedByWeapon = { ...this.shapedByWeapon, [data.w]: data.s };
          }
          this._touchWeaponA(data.w);
        }
        // Slot B (compare mode)
        if (data.c) {
          this.compareMode = true;
          this.activeSlot = "A";
          if (typeof data.wb === "string" && data.wb) {
            this.selectedWeaponIdB = data.wb;
            if (data.pb && typeof data.pb === "object") {
              this.picksByWeaponB = { ...this.picksByWeaponB, [data.wb]: data.pb };
            }
            if (data.sb && typeof data.sb === "object") {
              this.shapedByWeaponB = { ...this.shapedByWeaponB, [data.wb]: data.sb };
            }
            this._touchWeaponB(data.wb);
          }
        }
        this.save();
      } catch {
        // Malformed payload — ignore quietly rather than blocking the page.
      }
      // Strip the hash so refreshes don't re-hydrate stale state.
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        // ignore
      }
    },

    /** Revert a level back to its original tree perk (no confirmation). */
    restoreShape(slot: "A" | "B", level: number) {
      const weaponId = slot === "A" ? this.selectedWeaponId : this.selectedWeaponIdB;
      if (!weaponId) return;
      const mapKey = slot === "A" ? "shapedByWeapon" : "shapedByWeaponB";
      const existing = { ...(this[mapKey][weaponId] ?? {}) };
      if (!(level in existing)) return;
      delete existing[level];
      // Prune empty maps so the persisted state stays tidy.
      if (Object.keys(existing).length === 0) {
        const copy = { ...this[mapKey] };
        delete copy[weaponId];
        this[mapKey] = copy;
      } else {
        this[mapKey] = { ...this[mapKey], [weaponId]: existing };
      }
      this.save();
    },

    /** All shape options the currently-active slot's weapon can pick
     *  from (universal + its vocation). Feeds the modal grid. */
    get shapeModalOptions(): readonly ShapeOption[] {
      const slot = this.shapeModalSlot;
      if (!slot) return [];
      const w = slot === "A" ? this.selectedWeapon : this.selectedWeaponB;
      if (!w) return [];
      const q = this.shapeModalSearch.trim().toLowerCase();
      const compatible = shapeOptionsFor(w.vocation);
      if (!q) return compatible;
      return compatible.filter((o) => o.name.toLowerCase().includes(q));
    },

    // ---- Compare diff arrows -----------------------------------------
    //
    // In compare mode we show a small ↑/↓ next to each numeric stat on
    // both Weapon Summary panels so the reader can spot at a glance
    // which build wins each row. The arrow reflects the slot's OWN
    // standing: A gets ↑ when A.total > B.total, ↓ when A.total <
    // B.total; B mirrors it. Returns null when compare is off or one
    // side doesn't expose this stat (so the arrow is hidden).

    /** Effective total for a stat on a summary, or null when the summary
     *  doesn't surface this stat at all (both hasBase and hasBonus are
     *  false → the row isn't rendered in the UI, so a diff isn't
     *  meaningful). */
    _summaryStatValue(summary: WeaponSummary | null, statKey: StatKey): number | null {
      if (!summary) return null;
      const s = summary.stats[statKey];
      if (!s.hasBase && !s.hasBonus) return null;
      return s.total;
    },

    /** Compare a StatKey between the two slots for `thisSlot`'s
     *  perspective. Returns 1 (this slot wins), -1 (loses), 0 (tie),
     *  or null (compare off or one side has no value → nothing to show). */
    compareDiffStat(statKey: StatKey, thisSlot: "A" | "B"): -1 | 0 | 1 | null {
      if (!this.compareMode) return null;
      const a = this._summaryStatValue(this.weaponSummary, statKey);
      const b = this._summaryStatValue(this.weaponSummaryB, statKey);
      if (a == null || b == null) return null;
      const mine = thisSlot === "A" ? a : b;
      const other = thisSlot === "A" ? b : a;
      if (mine === other) return 0;
      return mine > other ? 1 : -1;
    },

    /** Same idea for native numeric fields (range / manaCost / imbueSlots).
     *  Higher-is-better assumption holds for all of them. */
    compareDiffNative(field: "range" | "manaCost" | "imbueSlots", thisSlot: "A" | "B"): -1 | 0 | 1 | null {
      if (!this.compareMode) return null;
      const a = this.weaponSummary?.native?.[field] ?? null;
      const b = this.weaponSummaryB?.native?.[field] ?? null;
      if (a == null || b == null) return null;
      const mine = thisSlot === "A" ? a : b;
      const other = thisSlot === "A" ? b : a;
      if (mine === other) return 0;
      // Mana cost: lower is better (spending less mana to fire is a
      // straight win). Everything else: higher wins.
      if (field === "manaCost") {
        return mine < other ? 1 : -1;
      }
      return mine > other ? 1 : -1;
    },

    // ---- Effective-render helpers ------------------------------------
    // The template iterates raw tree choices; these helpers let it show
    // the SHAPED representation (icon / description) at levels where a
    // shape has been applied, without duplicating the shape lookup
    // inline all over the place.

    /** Icon path for a tree choice square. Only swaps in the shape
     *  icon when the shape is anchored to THIS specific (level, idx) —
     *  a shape at a sibling choice leaves this square alone. */
    resolvedIconForPerk(weaponId: string, level: number, idx: number, perkBase: string | undefined, slot: "A" | "B" = "A"): string | undefined {
      const shape = slot === "A"
        ? this.getShapedForPick(weaponId, level, idx)
        : this.getShapedForPickB(weaponId, level, idx);
      if (shape) return shape.icon;
      return perkBase;
    },

    /** Augment overlay path for a tree choice. Shaped choices hide
     *  their original augment badge; sibling choices keep theirs. */
    resolvedAugmentForPerk(weaponId: string, level: number, idx: number, perkAugment: string | undefined, slot: "A" | "B" = "A"): string | undefined {
      const shape = slot === "A"
        ? this.getShapedForPick(weaponId, level, idx)
        : this.getShapedForPickB(weaponId, level, idx);
      if (shape) return undefined;
      return perkAugment;
    },

    /** Description text for the tree bottom row. Uses the shape's rank10
     *  text (max rank — the planner assumes end-game builds) ONLY when
     *  the picked choice at that level is the shape's anchor choice
     *  (otherwise the shape is dormant). */
    resolvedDescriptionForLevel(weaponId: string, level: number, originalDesc: string, slot: "A" | "B" = "A"): string {
      const pick = slot === "A" ? this.getPick(weaponId, level) : this.getPickB(weaponId, level);
      if (pick < 0) return originalDesc;
      const shape = slot === "A"
        ? this.getShapedForPick(weaponId, level, pick)
        : this.getShapedForPickB(weaponId, level, pick);
      if (shape) return `${shape.name} — ${shape.rank10}`;
      return originalDesc;
    },
  };
}
