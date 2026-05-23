/**
 * Alpine module for the Offline Training sub-tab.
 *
 * Mirrors the structure of trainingTab.ts (Exercise Weapons) for
 * consistency: singleton activeInstance pattern + same reactive
 * conventions. Phase 2 wires `computeOfflineTraining` to the form;
 * Phase 3 cross-verifies the constants against TibiaPal.
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

const STORAGE_KEY = "tibiaplanner.offlineTraining";
const CHARACTER_KEY = "tibiaplanner.character";
const RESET_EVENT = "app:reset";
const CHARACTER_EVENT = "character:updated";

export const OFFLINE_SKILLS: readonly OfflineSkill[] = [
  "Magic level",
  "Sword",
  "Axe",
  "Club",
  "Distance",
  "Fist",
] as const;

export const LOYALTY_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

interface PersistedOfflineTraining {
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
// accumulation across ClientRouter swaps.
let activeInstance: ReturnType<typeof offlineTrainingTab> | null = null;
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => {
    activeInstance?.reset();
  });
  window.addEventListener(CHARACTER_EVENT, (e: Event) => {
    activeInstance?._onCharacterUpdated((e as CustomEvent).detail);
  });
}

function readCharacterVocation(): string {
  try {
    const raw = localStorage.getItem(CHARACTER_KEY);
    if (!raw) return "";
    const data = JSON.parse(raw);
    return typeof data?.vocation === "string" ? data.vocation : "";
  } catch {
    return "";
  }
}

export function offlineTrainingTab() {
  return {
    ...defaults(),

    vocation: "",
    OFFLINE_SKILLS,
    LOYALTY_OPTIONS,

    init() {
      installBus();
      activeInstance = this;
      this.vocation = readCharacterVocation();
      this.load();
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          Object.assign(this, defaults(), data);
        }
      } catch {
        // ignore
      }
    },

    save() {
      const snapshot: PersistedOfflineTraining = {
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

    _onCharacterUpdated(detail: unknown) {
      if (!detail || typeof detail !== "object") return;
      const d = detail as { vocation?: string };
      if (typeof d.vocation === "string" && d.vocation !== this.vocation) {
        this.vocation = d.vocation;
        // If the picked skill isn't valid for the new vocation, drop it.
        // (Same defensive sweep trainingTab does.)
        if (this.skill && !this._skillValidForVocation(this.skill)) {
          this.skill = "";
          this.currentSkill = null;
          this.pctToGo = null;
          this.targetSkill = null;
          this.showResults = false;
          this.shieldingOpen = false;
          this.shieldingCurrent = null;
          this.shieldingPctToGo = null;
          this.save();
        }
      }
    },

    /** Some skills aren't trainable for certain vocations (e.g. paladin
     *  cannot use a Sword statue). For Phase 2 we keep the dropdown open
     *  to all 6 skills regardless of vocation — the validator on
     *  Calculate will catch the (vocation × skill) combos that have no
     *  defined vocation constant. */
    _skillValidForVocation(_skill: string): boolean {
      return true;
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

    get isValid(): boolean {
      const input = this._asInput();
      return input != null && validateOfflineInput(input) == null;
    },

    /** First validation error message, or "" if valid. */
    get fieldError(): string {
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
