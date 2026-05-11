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

const STORAGE_KEY = "tibiaplanner.training";
const CHARACTER_KEY = "tibiaplanner.character";
const RESET_EVENT = "app:reset";
const CHARACTER_EVENT = "character:updated";

export const LOYALTY_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

/** Fixed TC ↔ gp rate used to display the gp equivalent of weapon cost. */
const TC_THRESHOLD_GP = 14000;

interface PersistedTraining {
  skill: string;
  currentSkill: number | null;
  pctToNext: number | null;
  targetSkill: number | null;
  doubleEvent: boolean;
  privateDummy: boolean;
  loyalty: number;
  tcOverThreshold: boolean;
  showResults: boolean;
}

function defaults(): PersistedTraining {
  return {
    skill: "",
    currentSkill: null,
    pctToNext: null,
    targetSkill: null,
    doubleEvent: false,
    privateDummy: false,
    loyalty: 0,
    tcOverThreshold: true,
    showResults: false,
  };
}

interface CharacterSnapshot {
  vocation?: string;
  skills?: Record<string, number | null>;
  pctToNextBySkill?: Record<string, number | null>;
}

function readCharacter(): CharacterSnapshot {
  try {
    const raw = localStorage.getItem(CHARACTER_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data && typeof data === "object") return data as CharacterSnapshot;
  } catch {
    // ignore
  }
  return {};
}

/** Write back to the character store (skill value), then notify listeners. */
function writeCharacterSkill(skill: string, value: number | null) {
  if (!skill) return;
  try {
    const raw = localStorage.getItem(CHARACTER_KEY);
    const ch = raw && raw.trim() ? JSON.parse(raw) : {};
    if (typeof ch !== "object" || ch === null) return;
    ch.skills = ch.skills ?? {};
    if (ch.skills[skill] === value) return; // no-op, prevents feedback loops
    ch.skills[skill] = value;
    localStorage.setItem(CHARACTER_KEY, JSON.stringify(ch));
    window.dispatchEvent(new CustomEvent(CHARACTER_EVENT, { detail: ch }));
  } catch {
    // ignore
  }
}

/** Write back the per-skill "% to next" value to the character store. */
function writeCharacterSkillPct(skill: string, value: number | null) {
  if (!skill) return;
  try {
    const raw = localStorage.getItem(CHARACTER_KEY);
    const ch = raw && raw.trim() ? JSON.parse(raw) : {};
    if (typeof ch !== "object" || ch === null) return;
    ch.pctToNextBySkill = ch.pctToNextBySkill ?? {};
    if (ch.pctToNextBySkill[skill] === value) return; // no-op
    ch.pctToNextBySkill[skill] = value;
    localStorage.setItem(CHARACTER_KEY, JSON.stringify(ch));
    window.dispatchEvent(new CustomEvent(CHARACTER_EVENT, { detail: ch }));
  } catch {
    // ignore
  }
}

export function trainingTab() {
  return {
    ...defaults(),

    vocation: "",
    LOYALTY_OPTIONS,

    init() {
      const ch = readCharacter();
      this.vocation = ch.vocation ?? "";
      this.load();

      // If a skill is selected and the character has a value, prefer character.
      if (this.skill && ch.skills?.[this.skill] != null) {
        this.currentSkill = ch.skills[this.skill] as number;
      }
      // Same for "% to next" — Death sim and Training share this per skill.
      if (this.skill && ch.pctToNextBySkill?.[this.skill] != null) {
        this.pctToNext = ch.pctToNextBySkill[this.skill] as number;
      }

      // Consistency repair: if "Skill to train" is empty (e.g. left over from
      // a previous session or a dropdown reset), the dependent inputs MUST be
      // blank. They only make sense paired with a selected skill.
      if (!this.skill) {
        this.clearSkillDependents();
      }

      // Reactive guard for the same invariant going forward — whenever the
      // user picks "Select skill" again the inputs clear automatically.
      // Cast: Alpine's $watch isn't in our local type defs.
      (this as unknown as { $watch: (path: string, cb: (v: unknown) => void) => void })
        .$watch("skill", (value) => {
          if (!value) this.clearSkillDependents();
        });

      window.addEventListener(RESET_EVENT, () => this.reset());

      window.addEventListener(CHARACTER_EVENT, ((e: Event) => {
        const detail = (e as CustomEvent<CharacterSnapshot>).detail;
        if (!detail) return;

        // Vocation propagation
        const newVocation = detail.vocation ?? "";
        if (newVocation !== this.vocation) {
          this.vocation = newVocation;
          if (this.skill && !this.availableSkills.find((s) => s.skill === this.skill)) {
            this.skill = "";
            this.currentSkill = null;
            this.pctToNext = null;
            this.showResults = false;
            this.save();
          }
        }

        // Skill value propagation (CharacterSheet → Training)
        if (this.skill && detail.skills) {
          const incoming = detail.skills[this.skill];
          if (incoming != null && incoming !== this.currentSkill) {
            this.currentSkill = incoming as number;
            this.save();
          }
        }

        // "% to next" propagation (CharacterSheet → Training)
        if (this.skill && detail.pctToNextBySkill) {
          const incomingPct = detail.pctToNextBySkill[this.skill];
          if (incomingPct != null && incomingPct !== this.pctToNext) {
            this.pctToNext = incomingPct as number;
            this.save();
          }
        }
      }) as EventListener);
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
      const snapshot: PersistedTraining = {
        skill: this.skill,
        currentSkill: this.currentSkill,
        pctToNext: this.pctToNext,
        targetSkill: this.targetSkill,
        doubleEvent: this.doubleEvent,
        privateDummy: this.privateDummy,
        loyalty: this.loyalty,
        tcOverThreshold: this.tcOverThreshold,
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
      this.save();
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
      const errs: Record<string, string> = {};
      if (!this.skill) errs.skill = "Pick a skill";
      const cur = this.currentSkill;
      const tgt = this.targetSkill;
      const pct = this.pctToNext;
      if (cur == null || !Number.isFinite(cur) || cur < 0) {
        errs.currentSkill = "Enter your current skill";
      }
      if (pct == null || !Number.isFinite(pct)) {
        errs.pctToNext = "Enter % to next (0–100)";
      } else if (pct < 0 || pct > 100) {
        errs.pctToNext = "Must be 0 – 100";
      }
      if (tgt == null || !Number.isFinite(tgt) || tgt <= 0) {
        errs.targetSkill = "Enter target skill";
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
        pctToNext: this.pctToNext as number,
        targetSkill: this.targetSkill as number,
      });
    },

    weaponResult(weaponType: "regular" | "durable" | "lasting"): WeaponResult | null {
      if (!this.isValid) return null;
      return computeSingleWeaponResult(
        this.pointsRequired,
        this.vocationConstant,
        this.currentSkill as number,
        this.pctToNext as number,
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
        this.pctToNext as number,
        this.modifiers,
        TC_THRESHOLD_GP,
      );
    },

    // ---- Mutations ----

    /** Force Current Skill / % to next / showResults blank — used whenever
     *  the "Skill to train" dropdown is cleared to "Select skill". */
    clearSkillDependents() {
      let touched = false;
      if (this.currentSkill !== null) { this.currentSkill = null; touched = true; }
      if (this.pctToNext !== null)    { this.pctToNext = null;    touched = true; }
      if (this.showResults)           { this.showResults = false; touched = true; }
      if (touched) this.save();
    },

    onSkillChange() {
      // Re-sync currentSkill AND "% to next" from character on skill change.
      const ch = readCharacter();
      const charSkill = ch.skills?.[this.skill];
      this.currentSkill =
        charSkill != null && Number.isFinite(charSkill)
          ? (charSkill as number)
          : null;
      const charPct = ch.pctToNextBySkill?.[this.skill];
      this.pctToNext =
        charPct != null && Number.isFinite(charPct)
          ? (charPct as number)
          : null;
      this.save();
    },

    onCurrentSkillChange() {
      // Push back into the character store so both sheets stay in sync.
      if (this.skill && this.currentSkill != null) {
        writeCharacterSkill(this.skill, this.currentSkill as number);
      }
      this.save();
    },

    onPctChange() {
      // Clamp to [0, 100] and round to 2 decimals — matches the in-game
      // skill display ("Sword 80 (42.50%)") and the Death sim input.
      const v = Number(this.pctToNext);
      let final: number | null;
      if (Number.isFinite(v)) {
        const clamped = Math.max(0, Math.min(100, v));
        final = Math.round(clamped * 100) / 100;
        this.pctToNext = final;
      } else {
        final = null;
      }
      // Mirror to the character store so the Death sim picks it up too.
      if (this.skill) {
        writeCharacterSkillPct(this.skill, final);
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
