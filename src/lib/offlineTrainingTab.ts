/**
 * Alpine module for the Offline Training calculator.
 *
 * Standalone calculator — no dependency on the Character Sheet. The user
 * picks vocation and skill in the calc itself. Skills are filtered by
 * vocation using TRAINING_BY_VOCATION, since offline statues follow the
 * same "which skill can this vocation actually train" rules as exercise
 * weapons (with Magic Level and the main melee/distance/fist for the
 * matching vocation).
 */

import {
  computeOfflineTraining,
  computeShieldingAdvance,
  validateOfflineInput,
  validateShieldingAdvance,
  type OfflineInput,
  type OfflineResult,
  type OfflineSkill,
  type ShieldingAdvanceInput,
  type ShieldingAdvanceResult,
} from "./offlineTrainingCalc";
import { TRAINING_BY_VOCATION, type TrainableSkill } from "../data/training";

const STORAGE_KEY = "tibiaplanner.offlineTraining";
const RESET_EVENT = "app:reset";

/** Same vocation list as the Exercise Weapons calc — kept in sync
 *  intentionally (both calcs work off the same universe of vocations). */
export const VOCATIONS = ["druid", "knight", "monk", "paladin", "sorcerer"] as const;

export const LOYALTY_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

interface PersistedOfflineTraining {
  vocation: string;
  skill: OfflineSkill | "";
  currentSkill: number | null;
  /** In-game "% to go" — see trainingCalc.ts docstring for the convention. */
  pctToGo: number | null;
  targetSkill: number | null;
  doubleEvent: boolean;
  loyalty: number;
  showResults: boolean;
  /** Shielding-advance opt-in sub-form. */
  shieldingOpen: boolean;
  shieldingCurrent: number | null;
  shieldingPctToGo: number | null;
}

function defaults(): PersistedOfflineTraining {
  return {
    vocation: "",
    skill: "",
    currentSkill: null,
    pctToGo: null,
    targetSkill: null,
    doubleEvent: false,
    loyalty: 0,
    showResults: false,
    shieldingOpen: false,
    shieldingCurrent: null,
    shieldingPctToGo: null,
  };
}

// Singleton bus — same pattern as trainingTab.ts to avoid listener
// accumulation across ClientRouter swaps. Only RESET now (the calc
// is fully decoupled from the Character Sheet as of 2026-09-23).
let activeInstance: ReturnType<typeof offlineTrainingTab> | null = null;
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => {
    activeInstance?.reset();
  });
}

export function offlineTrainingTab() {
  return {
    ...defaults(),

    VOCATIONS,
    LOYALTY_OPTIONS,

    init() {
      installBus();
      activeInstance = this;
      this.load();

      // Reactive guard: if the user changes vocation and the current
      // skill is no longer valid for the new vocation, blank everything.
      // Full reset avoids half-cleared state from a previous vocation's
      // picks lingering visibly.
      const alpine = this as unknown as {
        $watch: (path: string, cb: (v: unknown) => void) => void;
      };
      alpine.$watch("vocation", () => {
        this.skill = "";
        this.currentSkill = null;
        this.pctToGo = null;
        this.targetSkill = null;
        this.showResults = false;
        this.shieldingOpen = false;
        this.shieldingCurrent = null;
        this.shieldingPctToGo = null;
        this.save();
      });
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          // Silent migration: old pctToNext/shieldingPctToNext → new pctToGo
          if (data.pctToNext != null && data.pctToGo == null) {
            data.pctToGo = data.pctToNext;
          }
          if (data.shieldingPctToNext != null && data.shieldingPctToGo == null) {
            data.shieldingPctToGo = data.shieldingPctToNext;
          }
          delete data.pctToNext;
          delete data.shieldingPctToNext;
          Object.assign(this, defaults(), data);
        }
      } catch {
        // ignore
      }
    },

    save() {
      const snapshot: PersistedOfflineTraining = {
        vocation: this.vocation,
        skill: this.skill,
        currentSkill: this.currentSkill,
        pctToGo: this.pctToGo,
        targetSkill: this.targetSkill,
        doubleEvent: this.doubleEvent,
        loyalty: this.loyalty,
        showResults: this.showResults,
        shieldingOpen: this.shieldingOpen,
        shieldingCurrent: this.shieldingCurrent,
        shieldingPctToGo: this.shieldingPctToGo,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    toggleShielding() {
      this.shieldingOpen = !this.shieldingOpen;
      this.save();
    },

    reset() {
      Object.assign(this, defaults());
      this.save();
    },

    onVocationChange() {
      this.save();
    },

    onCalculate() {
      this.result; // touch the getter so reactivity picks it up
      this.showResults = this.isValid;
      this.save();
    },

    onSkillChange() {
      this.save();
    },

    // ---- Computed ----

    /** Skills valid for the selected vocation (same source of truth as
     *  the Exercise Weapons calc). */
    get availableSkills(): readonly TrainableSkill[] {
      return TRAINING_BY_VOCATION[this.vocation] ?? [];
    },

    get isValid(): boolean {
      const input = this._asInput();
      return input != null && validateOfflineInput(input) == null;
    },

    /** First validation error message, or "" if valid. */
    get fieldError(): string {
      if (!this.vocation) return "Pick a vocation";
      const input = this._asInput();
      if (input == null) return "Fill in all fields";
      return validateOfflineInput(input) ?? "";
    },

    get result(): OfflineResult | null {
      const input = this._asInput();
      if (input == null) return null;
      return computeOfflineTraining(input);
    },

    /** Shielding-advance sub-form: are both fields filled in? */
    get shieldingFilled(): boolean {
      return (
        this.shieldingCurrent != null &&
        this.shieldingPctToGo != null
      );
    },

    /** Shielding-advance sub-form: validation message (or "" if OK). */
    get shieldingFieldError(): string {
      const input = this._asShieldingInput();
      if (input == null) return "Fill in both fields";
      return validateShieldingAdvance(input) ?? "";
    },

    /** Final shielding result — only computed when the sub-form is open
     *  AND the main result exists AND the user filled the two fields. */
    get shieldingResult(): ShieldingAdvanceResult | null {
      if (!this.shieldingOpen) return null;
      const main = this.result;
      if (!main) return null;
      const input = this._asShieldingInput();
      if (input == null) return null;
      return computeShieldingAdvance(input);
    },

    _asShieldingInput(): ShieldingAdvanceInput | null {
      const main = this.result;
      if (!main) return null;
      if (!this.vocation || !this.skill) return null;
      if (this.shieldingCurrent == null || this.shieldingPctToGo == null) {
        return null;
      }
      return {
        vocation: this.vocation,
        mainSkill: this.skill as OfflineSkill,
        currentShielding: this.shieldingCurrent,
        pctToGo: this.shieldingPctToGo,
        loyalty: this.loyalty,
        trainingMinutes: main.trainingMinutes,
      };
    },

    /** Pretty "X days" for the realDaysIfPlayingDaily output. */
    get realDaysDisplay(): string {
      const r = this.result;
      if (!r) return "";
      const days = r.realDaysIfPlayingDaily;
      if (days < 1) return "less than a day";
      if (days < 30) return `${days.toFixed(1)} days`;
      if (days < 365) return `${(days / 30).toFixed(1)} months`;
      return `${(days / 365).toFixed(1)} years`;
    },

    _asInput(): OfflineInput | null {
      if (!this.vocation || !this.skill) return null;
      if (
        this.currentSkill == null ||
        this.pctToGo == null ||
        this.targetSkill == null
      ) {
        return null;
      }
      return {
        vocation: this.vocation,
        skill: this.skill as OfflineSkill,
        currentSkill: this.currentSkill,
        pctToGo: this.pctToGo,
        targetSkill: this.targetSkill,
        loyalty: this.loyalty,
      };
    },
  };
}
