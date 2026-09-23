import { TRAINING_BY_VOCATION, type TrainableSkill } from "../data/training";
import {
  computeSingleWeaponResult,
  computeSmartMix,
  formatCount,
  formatGold,
  formatHours,
  pointsNeeded,
  type Modifiers,
  type SmartMixResult,
  type WeaponResult,
} from "./trainingCalc";

const STORAGE_KEY_BASE = "tibiaplanner.training";
const RESET_EVENT = "app:reset";

/**
 * Storage key per slot. The "primary" slot keeps the pre-multi-slot
 * key ("tibiaplanner.training") so we don't lose the user's existing
 * saved state. Secondary slots ("slot-2", "slot-3") suffix the base.
 */
function storageKeyFor(slotId: string): string {
  return slotId === "primary" ? STORAGE_KEY_BASE : `${STORAGE_KEY_BASE}.${slotId}`;
}

/**
 * Multi-instance bus. Every mounted trainingTab instance registers
 * itself under its slotId; RESET dispatches to every live instance.
 * Newer mount for the same slotId replaces the older one (standard
 * ClientRouter hydration pattern).
 *
 * 2026-09-23: the calc is fully decoupled from the Character Sheet.
 * Vocation is picked inside the calc itself via a dropdown, so we no
 * longer listen for `character:updated` or read/write the character
 * store. Only RESET remains.
 */
const activeInstances = new Map<string, ReturnType<typeof trainingTab>>();
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => {
    for (const inst of activeInstances.values()) inst.reset();
  });
}

export const LOYALTY_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

/** Vocations offered in the dropdown. Order matches Tibia's own listing
 *  in the character info page (alphabetical). */
export const VOCATIONS = ["druid", "knight", "monk", "paladin", "sorcerer"] as const;

/** Fixed TC ↔ gp rate used to display the gp equivalent of weapon cost. */
const TC_THRESHOLD_GP = 14000;

interface PersistedTraining {
  vocation: string;
  skill: string;
  currentSkill: number | null;
  /** In-game "% to go" (remaining %) — see trainingCalc.ts docstring. */
  pctToGo: number | null;
  targetSkill: number | null;
  doubleEvent: boolean;
  privateDummy: boolean;
  loyalty: number;
  tcOverThreshold: boolean;
  showResults: boolean;
}

function defaults(): PersistedTraining {
  return {
    vocation: "",
    skill: "",
    currentSkill: null,
    pctToGo: null,
    targetSkill: null,
    doubleEvent: false,
    privateDummy: false,
    loyalty: 0,
    tcOverThreshold: true,
    showResults: false,
  };
}

export function trainingTab(slotId: string = "primary") {
  return {
    ...defaults(),

    slotId,
    VOCATIONS,
    LOYALTY_OPTIONS,

    init() {
      installBus();
      activeInstances.set(this.slotId, this);
      this.load();

      // Consistency repair: if "Skill to train" is empty (e.g. left over
      // from a previous session or a dropdown reset), the dependent
      // inputs MUST be blank. They only make sense paired with a
      // selected skill. Same principle if vocation is empty — nothing
      // downstream is meaningful.
      if (!this.vocation) {
        this.skill = "";
        this.clearSkillDependents();
      } else if (!this.skill) {
        this.clearSkillDependents();
      }

      // Reactive guard: if the user clears the skill dropdown, blank
      // the dependent inputs. If they change vocation, drop the skill
      // when it's no longer valid for the new vocation.
      const alpine = this as unknown as {
        $watch: (path: string, cb: (v: unknown) => void) => void;
      };
      alpine.$watch("skill", (value) => {
        if (!value) this.clearSkillDependents();
      });
      alpine.$watch("vocation", () => {
        // When vocation changes, wipe every downstream field — including
        // targetSkill. Half-cleared state (e.g. old targetSkill lingering
        // for a different vocation's skill) is more confusing than a full
        // reset.
        this.skill = "";
        this.currentSkill = null;
        this.pctToGo = null;
        this.targetSkill = null;
        this.showResults = false;
        this.save();
      });

      // x-model + x-for ordering workaround. On a ClientRouter swap the
      // page hydrates fresh: <select x-model="skill"> evaluates against
      // the saved "Fist" BEFORE <template x-for> has emitted the matching
      // <option value="Fist">, so the browser silently falls back to the
      // first <option> ("Select skill"). Our reactive state is correct
      // but the DOM is desynced. After the next tick — once x-for has
      // settled the option list — push the value back into the DOM.
      if (this.skill) {
        const saved = this.skill;
        const alpineNext = this as unknown as {
          $nextTick: (cb: () => void) => void;
          $root: HTMLElement | undefined;
        };
        alpineNext.$nextTick(() => {
          const selects = alpineNext.$root?.querySelectorAll?.("select");
          if (!selects) return;
          for (const s of Array.from(selects)) {
            if (s instanceof HTMLSelectElement && s.value === "" && Array.from(s.options).some((o) => o.value === saved)) {
              s.value = saved;
            }
          }
        });
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(storageKeyFor(this.slotId));
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          // Silent migration: old saves stored the value under `pctToNext`.
          // Move it to `pctToGo` on load so a re-typed session picks up
          // seamlessly, and old orphan writes never reappear on save.
          if (data.pctToNext != null && data.pctToGo == null) {
            data.pctToGo = data.pctToNext;
          }
          delete data.pctToNext;
          Object.assign(this, defaults(), data);
        }
      } catch {
        // ignore
      }
    },

    save() {
      const snapshot: PersistedTraining = {
        vocation: this.vocation,
        skill: this.skill,
        currentSkill: this.currentSkill,
        pctToGo: this.pctToGo,
        targetSkill: this.targetSkill,
        doubleEvent: this.doubleEvent,
        privateDummy: this.privateDummy,
        loyalty: this.loyalty,
        tcOverThreshold: this.tcOverThreshold,
        showResults: this.showResults,
      };
      try {
        localStorage.setItem(storageKeyFor(this.slotId), JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    reset() {
      Object.assign(this, defaults());
      this.save();
    },

    /** Called by the parent trainingSlots wrapper when the user removes
     *  this slot. Wipes localStorage so a re-added slot starts fresh. */
    destroySlotStorage() {
      try {
        localStorage.removeItem(storageKeyFor(this.slotId));
      } catch {
        // ignore
      }
    },

    // ---- Computed ----

    get availableSkills(): readonly TrainableSkill[] {
      return TRAINING_BY_VOCATION[this.vocation] ?? [];
    },

    get selectedSkillData(): TrainableSkill | null {
      return this.availableSkills.find((s) => s.skill === this.skill) ?? null;
    },

    get vocationConstant(): number {
      return this.selectedSkillData?.vocationConstant ?? 1.1;
    },

    /** Per-field validation. Empty object = all valid. */
    get fieldErrors(): Record<string, string> {
      // Tibia's de-facto skill ceiling. Beyond this the exponential formulas
      // overflow JavaScript's Number range and cause infinite loops in the
      // weapon-mix solver, so we hard-cap user input here.
      const SKILL_CAP = 200;

      const errs: Record<string, string> = {};
      if (!this.vocation) errs.vocation = "Pick a vocation";
      if (!this.skill) errs.skill = "Pick a skill";
      const cur = this.currentSkill;
      const tgt = this.targetSkill;
      const pct = this.pctToGo;
      if (cur == null || !Number.isFinite(cur) || cur < 0) {
        errs.currentSkill = "Enter your current skill";
      } else if (cur > SKILL_CAP) {
        errs.currentSkill = `Max ${SKILL_CAP}`;
      }
      if (pct == null || !Number.isFinite(pct)) {
        errs.pctToGo = "Enter % to go (0–100)";
      } else if (pct < 0 || pct > 100) {
        errs.pctToGo = "Must be 0 – 100";
      }
      if (tgt == null || !Number.isFinite(tgt) || tgt <= 0) {
        errs.targetSkill = "Enter target skill";
      } else if (tgt > SKILL_CAP) {
        errs.targetSkill = `Max ${SKILL_CAP}`;
      } else if (cur != null && tgt <= cur) {
        errs.targetSkill = "Must be higher than current";
      }
      return errs;
    },

    get isValid(): boolean {
      return Object.keys(this.fieldErrors).length === 0;
    },

    get modifiers(): Modifiers {
      return {
        doubleEvent: this.doubleEvent,
        privateDummy: this.privateDummy,
        loyalty: Number.isFinite(this.loyalty) ? this.loyalty : 0,
      };
    },

    get pointsRequired(): number {
      if (!this.isValid) return 0;
      return pointsNeeded({
        vocationConstant: this.vocationConstant,
        currentSkill: this.currentSkill as number,
        pctToGo: this.pctToGo as number,
        targetSkill: this.targetSkill as number,
      });
    },

    weaponResult(weaponType: "regular" | "durable" | "lasting"): WeaponResult | null {
      if (!this.isValid) return null;
      return computeSingleWeaponResult(
        this.pointsRequired,
        this.vocationConstant,
        this.currentSkill as number,
        this.pctToGo as number,
        weaponType,
        this.modifiers,
        TC_THRESHOLD_GP,
      );
    },

    get cards() {
      return [
        { type: "regular", label: "Regular", charges: 500, result: this.weaponResult("regular") },
        { type: "durable", label: "Durable", charges: 1800, result: this.weaponResult("durable") },
        { type: "lasting", label: "Lasting", charges: 14400, result: this.weaponResult("lasting") },
      ];
    },

    get smartMix(): SmartMixResult | null {
      if (!this.isValid) return null;
      return computeSmartMix(
        this.pointsRequired,
        this.vocationConstant,
        this.currentSkill as number,
        this.pctToGo as number,
        this.modifiers,
        TC_THRESHOLD_GP,
      );
    },

    // ---- Mutations ----

    /** Force Current Skill / % to go / showResults blank — used whenever
     *  the "Skill to train" dropdown is cleared to "Select skill". */
    clearSkillDependents() {
      let touched = false;
      if (this.currentSkill !== null) { this.currentSkill = null; touched = true; }
      if (this.pctToGo !== null)      { this.pctToGo = null;      touched = true; }
      if (this.showResults)           { this.showResults = false; touched = true; }
      if (touched) this.save();
    },

    onVocationChange() {
      this.save();
    },

    onSkillChange() {
      // Standalone calc — no cross-sheet mirroring. Just persist.
      this.save();
    },

    onCurrentSkillChange() {
      this.save();
    },

    onPctChange() {
      // Clamp to [0, 100] and round to 2 decimals — matches the in-game
      // skill display ("You have 42.50% to go").
      const v = Number(this.pctToGo);
      if (Number.isFinite(v)) {
        const clamped = Math.max(0, Math.min(100, v));
        this.pctToGo = Math.round(clamped * 100) / 100;
      } else {
        this.pctToGo = null;
      }
      this.save();
    },

    calculate() {
      if (this.isValid) {
        this.showResults = true;
        this.save();
      } else {
        // Errors render reactively below; nothing to do here.
        this.showResults = false;
      }
    },

    // ---- Formatters exposed to templates ----

    fmtGold: formatGold,
    fmtHours: formatHours,
    fmtCount: formatCount,

    fmtPct(pct: number): string {
      if (!Number.isFinite(pct)) return "0.00";
      return Math.min(99.99, Math.max(0, pct)).toFixed(2);
    },

    /**
     * "% to next level" = 100 − endPct, capped at 99.99 (you never literally
     * have 100% to next — that would mean you just dinged).
     */
    fmtPctToNext(endPct: number): string {
      if (!Number.isFinite(endPct)) return "99.99";
      const remaining = 100 - Math.max(0, Math.min(100, endPct));
      return Math.min(99.99, Math.max(0, remaining)).toFixed(2);
    },
  };
}
