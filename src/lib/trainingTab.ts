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

// Singleton bus (see characterSheet.ts for the full rationale). Without
// this, every ClientRouter page swap re-registers window listeners on
// top of the old ones, and the cascading work eventually freezes the
// page when the user types fast enough in the calculator.
let activeInstance: ReturnType<typeof trainingTab> | null = null;
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

export const LOYALTY_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

/** Fixed TC ↔ gp rate used to display the gp equivalent of weapon cost. */
const TC_THRESHOLD_GP = 14000;

interface PersistedTraining {
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

interface CharacterSnapshot {
  vocation?: string;
  skills?: Record<string, number | null>;
  pctToGoBySkill?: Record<string, number | null>;
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

/** Write back the per-skill "% to go" value to the character store. */
function writeCharacterSkillPct(skill: string, value: number | null) {
  if (!skill) return;
  try {
    const raw = localStorage.getItem(CHARACTER_KEY);
    const ch = raw && raw.trim() ? JSON.parse(raw) : {};
    if (typeof ch !== "object" || ch === null) return;
    ch.pctToGoBySkill = ch.pctToGoBySkill ?? {};
    if (ch.pctToGoBySkill[skill] === value) return; // no-op
    ch.pctToGoBySkill[skill] = value;
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
      installBus();
      activeInstance = this;

      const ch = readCharacter();
      this.vocation = ch.vocation ?? "";
      this.load();

      // If a skill is selected and the character has a value, prefer character.
      if (this.skill && ch.skills?.[this.skill] != null) {
        this.currentSkill = ch.skills[this.skill] as number;
      }
      // Same for "% to go" — Death sim and Training share this per skill.
      if (this.skill && ch.pctToGoBySkill?.[this.skill] != null) {
        this.pctToGo = ch.pctToGoBySkill[this.skill] as number;
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

      // x-model + x-for ordering workaround. On a ClientRouter swap the
      // page hydrates fresh: <select x-model="skill"> evaluates against
      // the saved "Fist" BEFORE <template x-for> has emitted the matching
      // <option value="Fist">, so the browser silently falls back to the
      // first <option> ("Select skill"). Our reactive state is correct
      // but the DOM is desynced. After the next tick — once x-for has
      // settled the option list — push the value back into the DOM.
      if (this.skill) {
        const saved = this.skill;
        const alpine = this as unknown as {
          $nextTick: (cb: () => void) => void;
          $root: HTMLElement | undefined;
        };
        alpine.$nextTick(() => {
          const select = alpine.$root?.querySelector?.("select");
          if (select instanceof HTMLSelectElement && select.value !== saved) {
            select.value = saved;
          }
        });
      }
    },

    /**
     * Handle a `character:updated` event from the singleton bus. Mirrors
     * vocation / skill / "% to go" changes from the Character Sheet
     * (or Character Search "Use as profile") without dispatching anything
     * back — the equality guards short-circuit no-op writes so the same
     * value doesn't ping-pong.
     */
    _onCharacterUpdated(detail: CharacterSnapshot | null | undefined) {
      if (!detail) return;

      const newVocation = detail.vocation ?? "";
      if (newVocation !== this.vocation) {
        this.vocation = newVocation;
        if (this.skill && !this.availableSkills.find((s) => s.skill === this.skill)) {
          this.skill = "";
          this.currentSkill = null;
          this.pctToGo = null;
          this.showResults = false;
          this.save();
        }
      }

      if (this.skill && detail.skills) {
        const incoming = detail.skills[this.skill];
        if (incoming != null && incoming !== this.currentSkill) {
          this.currentSkill = incoming as number;
          this.save();
        }
      }

      if (this.skill && detail.pctToGoBySkill) {
        const incomingPct = detail.pctToGoBySkill[this.skill];
        if (incomingPct != null && incomingPct !== this.pctToGo) {
          this.pctToGo = incomingPct as number;
          this.save();
        }
      }
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
        pctToGo: this.pctToGo,
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
      // Tibia's de-facto skill ceiling. Beyond this the exponential formulas
      // overflow JavaScript's Number range and cause infinite loops in the
      // weapon-mix solver, so we hard-cap user input here.
      const SKILL_CAP = 200;

      const errs: Record<string, string> = {};
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

    onSkillChange() {
      // Re-sync currentSkill AND "% to go" from character on skill change.
      const ch = readCharacter();
      const charSkill = ch.skills?.[this.skill];
      this.currentSkill =
        charSkill != null && Number.isFinite(charSkill)
          ? (charSkill as number)
          : null;
      const charPct = ch.pctToGoBySkill?.[this.skill];
      this.pctToGo =
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
      // "You have ##.##% to go" display and the Death sim input.
      const v = Number(this.pctToGo);
      let final: number | null;
      if (Number.isFinite(v)) {
        const clamped = Math.max(0, Math.min(100, v));
        final = Math.round(clamped * 100) / 100;
        this.pctToGo = final;
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
