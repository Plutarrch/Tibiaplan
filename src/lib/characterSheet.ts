import {
  computeDeath,
  expFor,
  levelFor,
  type DeathResult,
  type DeathType,
} from "../data/formulas";
import {
  ALL_SKILLS,
  BLESSING_DISPLAY_ORDER,
  BLESSINGS,
  REGULAR_BLESSINGS_COUNT,
  SKILLS_BY_VOCATION,
  TWIST_OF_FATE_INDEX,
  type Vocation,
} from "../data/skills";
import { SKILL_VOCATION_CONSTANTS } from "../data/training";
import { computeSkillLossAfterDeath } from "./trainingCalc";

const STORAGE_KEY = "tibiaplanner.character";
const RESET_EVENT = "app:reset";
const UPDATED_EVENT = "character:updated";

type Skull = "none" | "white" | "red" | "black";

interface PersistedCharacter {
  name: string;
  vocation: string;
  promotion: boolean;
  level: number | null;
  experience: number | null;
  skills: Record<string, number | null>;
  /** 8 booleans: [0..6] regular blessings, [7] Twist of Fate. */
  blessings: boolean[];
  skull: Skull;
  showAllSkills: boolean;
  /**
   * Adventurer's Blessing is a free PvP-only protection while the character
   * is level 1-20. It is lost permanently on first reach of level 21 OR on
   * first PvP attack initiated by the player. We mirror that by storing a
   * "lost" flag the user can also toggle manually to simulate the latter.
   */
  adventurersLost: boolean;
  /**
   * "% remaining to next skill level" per skill (same convention as the
   * Training calculator). Persisted so the user doesn't have to retype it
   * across simulations. Only used by the post-death skill-loss expansion.
   */
  pctToNextBySkill: Record<string, number | null>;
}

function defaults(): PersistedCharacter {
  return {
    name: "",
    vocation: "",
    promotion: false,
    level: null,
    experience: null,
    skills: {},
    blessings: [true, true, true, true, true, true, true, true],
    skull: "none",
    showAllSkills: false,
    adventurersLost: false,
    pctToNextBySkill: {},
  };
}

/** Migrate a previously-saved 7-slot blessings array to the 8-slot layout. */
function migrateBlessings(raw: unknown): boolean[] {
  const fallback = [true, true, true, true, true, true, true, true];
  if (!Array.isArray(raw)) return fallback;
  const arr = raw.map(Boolean);
  if (arr.length === 8) return arr;
  if (arr.length === 7) {
    // Old layout: indices 0-5 were regulars, 6 was ToF. Insert Blood of the
    // Mountain (new index 5) defaulted to true; ToF moves from 6 to 7.
    return [arr[0], arr[1], arr[2], arr[3], arr[4], true, arr[5], arr[6]];
  }
  while (arr.length < 8) arr.push(true);
  return arr.slice(0, 8);
}

export function characterSheet() {
  return {
    ...defaults(),

    // Static data exposed to templates
    BLESSINGS,
    BLESSING_DISPLAY_ORDER,

    init() {
      this.load();
      // The Header dispatches this on Reset.
      window.addEventListener(RESET_EVENT, () => this.reset());

      // Listen for external writes (e.g. the Training tab updating a skill
      // value or "% to next"). Mirror the change into in-memory state without
      // re-saving (the writer already persisted), so we avoid loops.
      window.addEventListener(UPDATED_EVENT, ((e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (!detail || typeof detail !== "object") return;

        if (detail.skills) {
          let changed = false;
          const next = { ...this.skills };
          for (const [k, v] of Object.entries(detail.skills)) {
            if (next[k] !== v) {
              next[k] = v as number | null;
              changed = true;
            }
          }
          if (changed) this.skills = next;
        }

        if (detail.pctToNextBySkill) {
          let changed = false;
          const next = { ...this.pctToNextBySkill };
          for (const [k, v] of Object.entries(detail.pctToNextBySkill)) {
            if (next[k] !== v) {
              next[k] = v as number | null;
              changed = true;
            }
          }
          if (changed) this.pctToNextBySkill = next;
        }
      }) as EventListener);
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          // Merge over defaults so missing keys fall back gracefully.
          Object.assign(this, defaults(), data);
          // Old saves stored a 7-slot array; migrate to 8-slot layout.
          this.blessings = migrateBlessings(this.blessings);
        }
      } catch {
        // Ignore corrupted storage; fall through to defaults.
      }
    },

    save() {
      const snapshot: PersistedCharacter = {
        name: this.name,
        vocation: this.vocation,
        promotion: this.promotion,
        level: this.level,
        experience: this.experience,
        skills: { ...this.skills },
        blessings: [...this.blessings],
        skull: this.skull,
        showAllSkills: this.showAllSkills,
        adventurersLost: this.adventurersLost,
        pctToNextBySkill: { ...this.pctToNextBySkill },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // localStorage may be full or unavailable in private mode — ignore.
      }
      // Same-tab reactivity: 'storage' events don't fire for own writes, so
      // we broadcast a custom event for sibling components (Training tab).
      window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: snapshot }));
    },

    reset() {
      Object.assign(this, defaults());
      this.lastDeath = null;
      this.skillLossOpen = false;
      this.save();
    },

    // ---- Derived values (Alpine treats getters as reactive accessors) ----

    get availableSkills(): readonly string[] {
      if (this.showAllSkills) return ALL_SKILLS;
      const list = SKILLS_BY_VOCATION[this.vocation as Vocation];
      return list ?? [];
    },

    /** Total active flags across all 8 slots. Kept for backwards-compat readouts. */
    get blessingsActive(): number {
      return this.blessings.filter(Boolean).length;
    },

    /** Active regular blessings only (indices 0..6). Drives the death formula. */
    get regularBlessingsActive(): number {
      return this.blessings.slice(0, REGULAR_BLESSINGS_COUNT).filter(Boolean).length;
    },

    get hasTwistOfFate(): boolean {
      return !!this.blessings[TWIST_OF_FATE_INDEX];
    },

    /** Whether the character currently has Adventurer's Blessing active. */
    get hasAdventurersBlessing(): boolean {
      const lvl = Number(this.level);
      return Number.isFinite(lvl) && lvl >= 1 && lvl <= 20 && !this.adventurersLost;
    },

    /** 0..1 progress through the current level. */
    get levelProgress(): number {
      const lvl = this.level;
      const exp = this.experience;
      if (!lvl || exp == null) return 0;
      const base = expFor(lvl);
      const next = expFor(lvl + 1);
      const span = next - base;
      if (span <= 0) return 0;
      return Math.max(0, Math.min(1, (exp - base) / span));
    },

    /** Tibia exp-share range: ceil(level * 2/3) to floor(level * 3/2). */
    get shareRange(): { min: number; max: number } | null {
      if (!this.level) return null;
      return {
        min: Math.ceil(this.level * (2 / 3)),
        max: Math.floor(this.level * (3 / 2)),
      };
    },

    /**
     * Container/backpack drops with non-zero probability whenever the
     * character has fewer than 5 *regular* blessings (indices 0..6). Twist
     * of Fate doesn't count toward item-drop protection.
     */
    get backpackDropRisk(): boolean {
      return this.regularBlessingsActive < 5;
    },

    // ---- Mutations ----

    onLevelChange() {
      const lvl = Number(this.level);
      if (Number.isFinite(lvl) && lvl > 0) {
        const floored = Math.floor(lvl);
        this.level = floored;
        this.experience = expFor(floored);
      }
      this.save();
    },

    onExperienceChange() {
      const exp = Number(this.experience);
      if (Number.isFinite(exp) && exp >= 0) {
        this.experience = Math.floor(exp);
        this.level = levelFor(exp);
      }
      this.save();
    },

    onVocationChange() {
      // ~90% of active Tibia players have promotion — auto-tick the box every
      // time a vocation is selected. The user can still uncheck manually if
      // they're really running an unpromoted character.
      if (this.vocation) {
        this.promotion = true;
      }
      this.save();
    },

    setSkull(value: Skull) {
      this.skull = value;
      this.save();
    },

    toggleBlessing(i: number) {
      if (i < 0 || i >= this.blessings.length) return;
      this.blessings[i] = !this.blessings[i];
      this.save();
    },

    toggleShowAllSkills() {
      this.showAllSkills = !this.showAllSkills;
      this.save();
    },

    setSkill(skill: string, raw: string) {
      const next = { ...this.skills };
      if (raw === "") {
        next[skill] = null;
      } else {
        const value = Number(raw);
        next[skill] = Number.isFinite(value)
          ? Math.max(0, Math.min(999, Math.floor(value)))
          : null;
      }
      this.skills = next;
      this.save();
    },

    /** Manual toggle for users who want to simulate "I attacked first and lost Adventurer's". */
    toggleAdventurersBlessing() {
      const lvl = Number(this.level);
      if (!Number.isFinite(lvl) || lvl < 1 || lvl > 20) return;
      this.adventurersLost = !this.adventurersLost;
      this.save();
    },

    /** The most recent simulated death — drives the post-death summary table. */
    lastDeath: null as null | {
      type: DeathType;
      levelBefore: number;
      levelAfter: number;
      expBefore: number;
      expAfter: number;
      regularBlessingsBefore: number;
      regularBlessingsAfter: number;
      hadTwistOfFateBefore: boolean;
      hasTwistOfFateAfter: boolean;
      /** Full pre-death snapshot — used by Revive to roll back state. */
      blessingsBefore: boolean[];
      adventurersLostBefore: boolean;
      result: DeathResult;
    },

    clearLastDeath() {
      this.lastDeath = null;
      this.skillLossOpen = false;
    },

    /**
     * Roll back the simulated death: restore exp, level, blessings, and the
     * Adventurer's Blessing flag to what they were before. Skill levels and
     * the per-skill "% to next" values are preserved on purpose so the user
     * doesn't have to retype them between simulations.
     */
    revive() {
      if (!this.lastDeath) return;
      this.experience = this.lastDeath.expBefore;
      this.level = this.lastDeath.levelBefore;
      this.blessings = [...this.lastDeath.blessingsBefore];
      this.adventurersLost = this.lastDeath.adventurersLostBefore;
      this.lastDeath = null;
      this.skillLossOpen = false;
      this.save();
    },

    /** Human-readable label for the four death types — for the summary header. */
    deathTypeLabel(type: DeathType): string {
      switch (type) {
        case "pve":       return "PvE death";
        case "pvp-white": return "PvP · White Skull";
        case "pvp-red":   return "PvP · Red Skull";
        case "pvp-black": return "PvP · Black Skull";
      }
    },

    /** Localized integer formatter — keeps the table aligned for big numbers. */
    formatExp(n: number): string {
      if (!Number.isFinite(n)) return "0";
      return Math.round(n).toLocaleString();
    },

    // ---- Skill exp loss (post-death expansion) ---------------------------

    /** Transient toggle for the "Want to know skill exp loss?" expansion. */
    skillLossOpen: false as boolean,

    toggleSkillLoss() {
      this.skillLossOpen = !this.skillLossOpen;
    },

    /** Skills shown in the expansion = the pre-selected list for the vocation. */
    get vocationSkills(): readonly string[] {
      const list = SKILLS_BY_VOCATION[this.vocation as Vocation];
      return list ?? [];
    },

    /** True if every vocation skill has a non-empty "% to next" filled in. */
    get skillLossInputsReady(): boolean {
      if (this.vocationSkills.length === 0) return false;
      for (const s of this.vocationSkills) {
        const v = this.pctToNextBySkill[s];
        if (v == null || !Number.isFinite(v) || v < 0 || v > 100) return false;
      }
      return true;
    },

    /** Effective % of total exp lost in the simulated death (0..1). */
    get effectivePctLoss(): number {
      const d = this.lastDeath;
      if (!d || d.expBefore <= 0) return 0;
      return Math.max(0, Math.min(1, (d.expBefore - d.expAfter) / d.expBefore));
    },

    setSkillPct(skill: string, raw: string) {
      const next = { ...this.pctToNextBySkill };
      if (raw === "") {
        next[skill] = null;
      } else {
        const v = Number(raw);
        if (Number.isFinite(v)) {
          const clamped = Math.max(0, Math.min(100, v));
          // Keep at most 2 decimals — matches the in-game skill display.
          next[skill] = Math.round(clamped * 100) / 100;
        } else {
          next[skill] = null;
        }
      }
      this.pctToNextBySkill = next;
      this.save();
    },

    /**
     * Compute the (skill, % remaining) the character would have AFTER the
     * simulated death, given the current skill level and user-typed % to
     * next. Returns null if any input is missing or no death is loaded.
     */
    skillLossFor(skill: string): { before: { level: number; pct: number }; after: { level: number; pct: number } } | null {
      if (!this.lastDeath) return null;
      const lvl = this.skills[skill];
      const pct = this.pctToNextBySkill[skill];
      if (lvl == null || !Number.isFinite(lvl) || lvl < 1) return null;
      if (pct == null || !Number.isFinite(pct)) return null;
      const constants = SKILL_VOCATION_CONSTANTS[this.vocation];
      const vocationConstant = constants?.[skill];
      if (!vocationConstant) return null;
      const after = computeSkillLossAfterDeath(
        vocationConstant,
        lvl as number,
        pct as number,
        this.effectivePctLoss,
      );
      return {
        before: { level: lvl as number, pct: pct as number },
        after,
      };
    },

    fmtPct(pct: number): string {
      if (!Number.isFinite(pct)) return "0.00";
      return Math.min(99.99, Math.max(0, pct)).toFixed(2);
    },

    simulateDeath() {
      const lvl = Number(this.level) || 0;
      if (lvl < 2) return;

      const beforeExp = Number(this.experience) || 0;
      const beforeBless = [...this.blessings];
      const beforeRegular = this.regularBlessingsActive;
      const beforeTof = this.hasTwistOfFate;
      const beforeLevel = lvl;

      const deathType: DeathType =
        this.skull === "none"  ? "pve" :
        this.skull === "white" ? "pvp-white" :
        this.skull === "red"   ? "pvp-red" :
                                 "pvp-black";

      const result = computeDeath({
        level: lvl,
        totalExp: beforeExp,
        promoted: !!this.promotion,
        blessings: beforeBless,
        hasAdventurersBlessing: this.hasAdventurersBlessing,
        deathType,
      });

      const newExp = Math.max(0, beforeExp - result.expLost);
      this.experience = newExp;
      this.level = levelFor(newExp);
      this.blessings = result.blessingsAfter;

      this.lastDeath = {
        type: deathType,
        levelBefore: beforeLevel,
        levelAfter: this.level,
        expBefore: beforeExp,
        expAfter: newExp,
        regularBlessingsBefore: beforeRegular,
        regularBlessingsAfter: result.blessingsAfter.slice(0, 7).filter(Boolean).length,
        hadTwistOfFateBefore: beforeTof,
        hasTwistOfFateAfter: !!result.blessingsAfter[7],
        blessingsBefore: beforeBless,
        adventurersLostBefore: this.adventurersLost,
        result,
      };

      this.save();
    },
  };
}
