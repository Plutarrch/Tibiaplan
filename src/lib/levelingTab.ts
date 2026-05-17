/**
 * Alpine module for the Leveling Calculator.
 *
 * Mirrors the structure of trainingTab.ts / offlineTrainingTab.ts —
 * singleton activeInstance + busInstalled bus pattern to keep window
 * listeners from accumulating across Astro ClientRouter swaps.
 *
 * Auto-fills current level + total exp from the Character Sheet's
 * localStorage on init and on every `character:updated` event, so the
 * user only has to enter the TARGET level + pick a creature.
 */

import {
  computeLeveling,
  modifierMultiplier,
  validateLevelingInput,
  type LevelingInput,
  type LevelingModifiers,
  type LevelingResult,
} from "./levelingCalc";
import {
  LEVELING_CREATURES,
  suggestCreatureForLevel,
  type LevelingCreature,
} from "../data/levelingCreatures";
import { expFor } from "../data/formulas";

const STORAGE_KEY = "tibiaplanner.leveling";
const CHARACTER_KEY = "tibiaplanner.character";
const RESET_EVENT = "app:reset";
const CHARACTER_EVENT = "character:updated";

interface PersistedLeveling {
  targetLevel: number | null;
  creatureName: string;
  modifiers: LevelingModifiers;
  showResults: boolean;
}

function defaultModifiers(): LevelingModifiers {
  return {
    xpBoost: false,
    staminaBonus: false,
    doubleXp: false,
    boostedCreature: false,
  };
}

function defaults(): PersistedLeveling {
  return {
    targetLevel: null,
    creatureName: "",
    modifiers: defaultModifiers(),
    showResults: false,
  };
}

let activeInstance: ReturnType<typeof levelingTab> | null = null;
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

function readCharacterState(): { level: number; exp: number } {
  try {
    const raw = localStorage.getItem(CHARACTER_KEY);
    if (!raw) return { level: 0, exp: 0 };
    const data = JSON.parse(raw);
    const level = typeof data?.level === "number" ? data.level : 0;
    const exp =
      typeof data?.experience === "number" && data.experience >= 0
        ? data.experience
        : level > 0
          ? expFor(level)
          : 0;
    return { level, exp };
  } catch {
    return { level: 0, exp: 0 };
  }
}

export function levelingTab() {
  return {
    ...defaults(),

    /** Mirrored from the Character Sheet — not persisted here. */
    currentLevel: 0,
    currentExp: 0,

    LEVELING_CREATURES,

    init() {
      installBus();
      activeInstance = this;
      const state = readCharacterState();
      this.currentLevel = state.level;
      this.currentExp = state.exp;
      this.load();
      // Auto-suggest a creature on first load if none picked yet.
      if (!this.creatureName && this.currentLevel > 0) {
        const suggestion = suggestCreatureForLevel(this.currentLevel);
        if (suggestion) this.creatureName = suggestion.name;
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          // Merge defaults with persisted data so newly added modifier
          // keys don't end up undefined for users on the old shape.
          const merged: PersistedLeveling = {
            ...defaults(),
            ...data,
            modifiers: { ...defaultModifiers(), ...(data.modifiers ?? {}) },
          };
          Object.assign(this, merged);
        }
      } catch {
        // ignore
      }
    },

    save() {
      const snapshot: PersistedLeveling = {
        targetLevel: this.targetLevel,
        creatureName: this.creatureName,
        modifiers: this.modifiers,
        showResults: this.showResults,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    reset() {
      Object.assign(this, defaults());
      // Re-sync mirrored character state in case it changed.
      const state = readCharacterState();
      this.currentLevel = state.level;
      this.currentExp = state.exp;
      if (!this.creatureName && this.currentLevel > 0) {
        const suggestion = suggestCreatureForLevel(this.currentLevel);
        if (suggestion) this.creatureName = suggestion.name;
      }
      this.save();
    },

    _onCharacterUpdated(detail: unknown) {
      if (!detail || typeof detail !== "object") return;
      const d = detail as { level?: number; experience?: number };
      if (typeof d.level === "number" && d.level !== this.currentLevel) {
        this.currentLevel = d.level;
        // Re-suggest creature only if the user hasn't manually picked
        // something that still covers their new level.
        const current = LEVELING_CREATURES.find(
          (c) => c.name === this.creatureName,
        );
        const stillFits =
          current &&
          this.currentLevel >= current.range.min &&
          this.currentLevel <= current.range.max;
        if (!stillFits) {
          const suggestion = suggestCreatureForLevel(this.currentLevel);
          if (suggestion) this.creatureName = suggestion.name;
        }
      }
      if (typeof d.experience === "number" && d.experience !== this.currentExp) {
        this.currentExp = d.experience;
      }
    },

    onCalculate() {
      this.result; // touch the getter to make sure reactivity wires up
      this.showResults = this.isValid;
      this.save();
    },

    toggleModifier(key: keyof LevelingModifiers) {
      this.modifiers = {
        ...this.modifiers,
        [key]: !this.modifiers[key],
      };
      this.save();
    },

    // ---- Computed ----

    get selectedCreature(): LevelingCreature | null {
      return (
        LEVELING_CREATURES.find((c) => c.name === this.creatureName) ?? null
      );
    },

    get multiplier(): number {
      return modifierMultiplier(this.modifiers);
    },

    get isValid(): boolean {
      const input = this._asInput();
      return input != null && validateLevelingInput(input) == null;
    },

    get fieldError(): string {
      const input = this._asInput();
      if (input == null) return "Fill in all fields";
      return validateLevelingInput(input) ?? "";
    },

    get result(): LevelingResult | null {
      const input = this._asInput();
      if (input == null) return null;
      return computeLeveling(input);
    },

    _asInput(): LevelingInput | null {
      const creature = this.selectedCreature;
      if (!creature) return null;
      if (this.currentLevel == null || this.currentLevel <= 0) return null;
      if (this.targetLevel == null) return null;
      return {
        currentLevel: this.currentLevel,
        currentExp: this.currentExp,
        targetLevel: this.targetLevel,
        creatureBaseExp: creature.baseExp,
        modifiers: this.modifiers,
      };
    },
  };
}
