/**
 * Standalone Death Simulator.
 *
 * Previously lived inside the Character Sheet on the home page, coupled
 * to that global character state. Spun out into its own Alpine module
 * on 2026-09-23 with the same reasoning we applied to the training
 * calculators: each tool holds its own state, has its own inputs, and
 * doesn't reach into the Character Sheet localStorage. That way a
 * visitor arriving from Google directly at the Death Penalty guide can
 * use the simulator without having filled out a Character Sheet first.
 *
 * Same math and blessing/skull semantics as the pre-split version —
 * see src/data/formulas.ts (`computeDeath`) and the TibiaWiki links in
 * that file's docstring.
 */

import {
  computeDeath,
  expFor,
  levelFor,
  type DeathResult,
  type DeathType,
} from "../data/formulas";
import {
  BLESSING_DISPLAY_ORDER,
  BLESSINGS,
  REGULAR_BLESSINGS_COUNT,
  SKILLS_BY_VOCATION,
  TWIST_OF_FATE_INDEX,
  type Vocation,
} from "../data/skills";
import { SKILL_VOCATION_CONSTANTS } from "../data/training";
import { computeSkillLossAfterDeath } from "./trainingCalc";

const STORAGE_KEY = "tibiaplanner.deathSimulator";
const RESET_EVENT = "app:reset";

// Singleton bus (see characterSheet.ts / trainingTab.ts for the full
// rationale). Only RESET here — the simulator doesn't need to react
// to Character Sheet updates any more.
let activeInstance: ReturnType<typeof deathSimulator> | null = null;
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => {
    activeInstance?.reset();
  });
}

interface PersistedDeathSimulator {
  vocation: string;
  promotion: boolean;
  level: number | null;
  experience: number | null;
  /** 8 booleans: [0..6] regular blessings, [7] Twist of Fate. */
  blessings: boolean[];
  /**
   * "Adventurer's Blessing lost" flag — only meaningful for level 1-20.
   * Simulates the "I attacked first and lost it" scenario.
   */
  adventurersLost: boolean;
  /** Whether the "Show all skills" toggle is on for the skill loss grid. */
  showAllSkills: boolean;
  /** Per-skill level values entered by the user. */
  skills: Record<string, number | null>;
  /** In-game "% to go" per skill — feeds the skill-loss expansion. */
  pctToGoBySkill: Record<string, number | null>;
}

function defaults(): PersistedDeathSimulator {
  return {
    vocation: "",
    promotion: false,
    level: null,
    experience: null,
    blessings: [true, true, true, true, true, true, true, true],
    adventurersLost: false,
    showAllSkills: false,
    skills: {},
    pctToGoBySkill: {},
  };
}

export function deathSimulator() {
  return {
    ...defaults(),

    // Static data exposed to templates
    BLESSINGS,
    BLESSING_DISPLAY_ORDER,

    init() {
      installBus();
      activeInstance = this;
      this.load();
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          Object.assign(this, defaults(), data);
          // Same 7-slot → 8-slot migration the Character Sheet uses,
          // for anyone importing an old save shape.
          if (Array.isArray(this.blessings) && this.blessings.length !== 8) {
            const arr = this.blessings.map(Boolean);
            if (arr.length === 7) {
              this.blessings = [arr[0], arr[1], arr[2], arr[3], arr[4], true, arr[5], arr[6]];
            } else {
              while (arr.length < 8) arr.push(true);
              this.blessings = arr.slice(0, 8);
            }
          }
        }
      } catch {
        // ignore corrupted storage
      }
    },

    save() {
      const snapshot: PersistedDeathSimulator = {
        vocation: this.vocation,
        promotion: this.promotion,
        level: this.level,
        experience: this.experience,
        blessings: [...this.blessings],
        adventurersLost: this.adventurersLost,
        showAllSkills: this.showAllSkills,
        skills: { ...this.skills },
        pctToGoBySkill: { ...this.pctToGoBySkill },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // localStorage may be full or unavailable — ignore.
      }
    },

    reset() {
      Object.assign(this, defaults());
      this.lastDeath = null;
      this.skillLossOpen = false;
      this.save();
    },

    // ---- Derived values ------------------------------------------------

    get availableSkills(): readonly string[] {
      const list = SKILLS_BY_VOCATION[this.vocation as Vocation];
      const base = list ?? [];
      if (!this.showAllSkills) return base;
      // "Show all skills" just extends beyond the vocation-recommended
      // list — the underlying skills table already contains every skill.
      const all = Object.values(SKILLS_BY_VOCATION).flat();
      const uniq = new Set<string>([...base, ...all]);
      return Array.from(uniq);
    },

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

    /** Whether Adventurer's Blessing is currently active (lvl 1-20 only). */
    get hasAdventurersBlessing(): boolean {
      const lvl = Number(this.level);
      return Number.isFinite(lvl) && lvl >= 1 && lvl <= 20 && !this.adventurersLost;
    },

    /**
     * Container/backpack drops with non-zero probability whenever the
     * character has fewer than 5 *regular* blessings (indices 0..6).
     * Twist of Fate doesn't count toward item-drop protection.
     */
    get backpackDropRisk(): boolean {
      return this.regularBlessingsActive < 5;
    },

    // ---- Mutations -----------------------------------------------------

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

    // ---- Simulate death ------------------------------------------------

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
      blessingsBefore: boolean[];
      adventurersLostBefore: boolean;
      result: DeathResult;
    },

    clearLastDeath() {
      this.lastDeath = null;
      this.skillLossOpen = false;
    },

    /**
     * Roll back the simulated death: restore exp, level, blessings, and
     * the Adventurer's Blessing flag to what they were before. Skill
     * levels and per-skill "% to go" values are preserved so the user
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

    deathTypeLabel(type: DeathType): string {
      switch (type) {
        case "pve":       return "PvE death";
        case "pvp-white": return "PvP · White Skull";
        case "pvp-red":   return "PvP · Red Skull";
        case "pvp-black": return "PvP · Black Skull";
      }
    },

    formatExp(n: number): string {
      if (!Number.isFinite(n)) return "0";
      return Math.round(n).toLocaleString();
    },

    simulateDeath() {
      const lvl = Number(this.level) || 0;
      if (lvl < 2) return;

      const beforeExp = Number(this.experience) || 0;
      const beforeBless = [...this.blessings];
      const beforeRegular = this.regularBlessingsActive;
      const beforeTof = this.hasTwistOfFate;
      const beforeLevel = lvl;

      // Skull selector isn't part of the simulator UI — the calc always
      // models a PvE death since that's ~99% of what players ask about.
      // The underlying computeDeath still supports PvP flavors, so we
      // can wire a skull selector back in later without touching math.
      const deathType: DeathType = "pve";

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

    // ---- Skill exp loss (post-death expansion) -------------------------

    skillLossOpen: false as boolean,

    toggleSkillLoss() {
      this.skillLossOpen = !this.skillLossOpen;
    },

    get vocationSkills(): readonly string[] {
      const list = SKILLS_BY_VOCATION[this.vocation as Vocation];
      return list ?? [];
    },

    get skillLossInputsReady(): boolean {
      if (this.vocationSkills.length === 0) return false;
      for (const s of this.vocationSkills) {
        const v = this.pctToGoBySkill[s];
        if (v == null || !Number.isFinite(v) || v < 0 || v > 100) return false;
      }
      return true;
    },

    get effectivePctLoss(): number {
      const d = this.lastDeath;
      if (!d || d.expBefore <= 0) return 0;
      return Math.max(0, Math.min(1, (d.expBefore - d.expAfter) / d.expBefore));
    },

    setSkillPct(skill: string, raw: string) {
      const next = { ...this.pctToGoBySkill };
      if (raw === "") {
        next[skill] = null;
      } else {
        const v = Number(raw);
        if (Number.isFinite(v)) {
          const clamped = Math.max(0, Math.min(100, v));
          next[skill] = Math.round(clamped * 100) / 100;
        } else {
          next[skill] = null;
        }
      }
      this.pctToGoBySkill = next;
      this.save();
    },

    skillLossFor(skill: string): { before: { level: number; pct: number }; after: { level: number; pct: number } } | null {
      if (!this.lastDeath) return null;
      const lvl = this.skills[skill];
      const pct = this.pctToGoBySkill[skill];
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
  };
}
