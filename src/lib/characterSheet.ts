import { computeDeathLoss, expFor, levelFor } from "../data/formulas";
import {
  ALL_SKILLS,
  BLESSINGS,
  SKILLS_BY_VOCATION,
  type Vocation,
} from "../data/skills";

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
  blessings: boolean[];
  skull: Skull;
  showAllSkills: boolean;
}

function defaults(): PersistedCharacter {
  return {
    name: "",
    vocation: "",
    promotion: false,
    level: null,
    experience: null,
    skills: {},
    blessings: [true, true, true, true, true, true, true],
    skull: "none",
    showAllSkills: false,
  };
}

export function characterSheet() {
  return {
    ...defaults(),

    // Static data exposed to templates
    BLESSINGS,

    init() {
      this.load();
      // The Header dispatches this on Reset.
      window.addEventListener(RESET_EVENT, () => this.reset());

      // Listen for external writes (e.g. the Training tab updating a skill
      // value via writeCharacterSkill). Mirror the change into in-memory state
      // without re-saving (the writer already persisted), so we avoid loops.
      window.addEventListener(UPDATED_EVENT, ((e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (!detail || typeof detail !== "object") return;
        if (!detail.skills) return;
        let changed = false;
        const next = { ...this.skills };
        for (const [k, v] of Object.entries(detail.skills)) {
          if (next[k] !== v) {
            next[k] = v as number | null;
            changed = true;
          }
        }
        if (changed) this.skills = next;
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
      this.save();
    },

    // ---- Derived values (Alpine treats getters as reactive accessors) ----

    get availableSkills(): readonly string[] {
      if (this.showAllSkills) return ALL_SKILLS;
      const list = SKILLS_BY_VOCATION[this.vocation as Vocation];
      return list ?? [];
    },

    get blessingsActive(): number {
      return this.blessings.filter(Boolean).length;
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

    get backpackDropRisk(): boolean {
      return this.blessingsActive < 5;
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

    simulateDeath() {
      const lvl = Number(this.level) || 0;
      if (lvl < 2) return;

      const isPvP = this.skull !== "none";
      const result = computeDeathLoss({
        level: lvl,
        blessingsActive: this.blessingsActive,
        isPvP,
        hadTwistOfFate: !!this.blessings[6],
      });

      const beforeExp = Number(this.experience) || 0;
      const newExp = Math.max(0, beforeExp - result.expLost);
      this.experience = newExp;
      this.level = levelFor(newExp);
      this.blessings = result.blessingsAfter;
      this.save();
    },
  };
}
