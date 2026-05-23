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

// Singleton bus: window listeners are registered ONCE per module evaluation
// and always dispatch to the most recent live instance. Without this,
// Astro's ClientRouter (which swaps document.body on every cross-page nav)
// causes new Alpine instances to register new listeners on top of the old
// ones, doubling the work each round trip until the page eventually
// freezes. activeInstance is null between unmounts and remounts.
let activeInstance: ReturnType<typeof characterSheet> | null = null;
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => {
    activeInstance?.reset();
  });
  window.addEventListener(UPDATED_EVENT, (e: Event) => {
    activeInstance?._onCharacterUpdated((e as CustomEvent).detail);
  });
}

interface PersistedCharacter {
  name: string;
  vocation: string;
  promotion: boolean;
  level: number | null;
  experience: number | null;
  skills: Record<string, number | null>;
  /** 8 booleans: [0..6] regular blessings, [7] Twist of Fate. */
  blessings: boolean[];
  showAllSkills: boolean;
  /**
   * Adventurer's Blessing is a free PvP-only protection while the character
   * is level 1-20. It is lost permanently on first reach of level 21 OR on
   * first PvP attack initiated by the player. We mirror that by storing a
   * "lost" flag the user can also toggle manually to simulate the latter.
   */
  adventurersLost: boolean;
  /**
   * In-game "% to go" toward the next skill level, per skill (same
   * convention as the Training calculator — see trainingCalc.ts docstring).
   * Persisted so the user doesn't have to retype it across simulations.
   * Only used by the post-death skill-loss expansion.
   */
  pctToGoBySkill: Record<string, number | null>;
  /**
   * Current stamina as a raw "HH:MM" string typed by the user. Capped at
   * 42:00 (the in-game maximum). The mini-calc below the blessings reads
   * this and outputs offline-time-to-max.
   */
  staminaInput: string;
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
    showAllSkills: false,
    adventurersLost: false,
    pctToGoBySkill: {},
    staminaInput: "",
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
      installBus();
      activeInstance = this;
      this.load();
    },

    /**
     * Handle a `character:updated` event coming through the singleton bus.
     * Mirrors external writes (Training tab, Character Search "Use as
     * profile") into in-memory state WITHOUT re-saving — the writer already
     * persisted, so saving again would just bounce the event back.
     */
    _onCharacterUpdated(detail: unknown) {
      if (!detail || typeof detail !== "object") return;
      const d = detail as Record<string, unknown>;

      if (typeof d.name === "string") this.name = d.name;
      if (typeof d.vocation === "string") this.vocation = d.vocation;
      if (typeof d.promotion === "boolean") this.promotion = d.promotion;
      if (d.level !== undefined) this.level = d.level as number | null;
      if (d.experience !== undefined) this.experience = d.experience as number | null;

      if (d.skills && typeof d.skills === "object") {
        let changed = false;
        const next = { ...this.skills };
        for (const [k, v] of Object.entries(d.skills as Record<string, unknown>)) {
          if (next[k] !== v) {
            next[k] = v as number | null;
            changed = true;
          }
        }
        if (changed) this.skills = next;
      }

      if (d.pctToGoBySkill && typeof d.pctToGoBySkill === "object") {
        let changed = false;
        const next = { ...this.pctToGoBySkill };
        for (const [k, v] of Object.entries(d.pctToGoBySkill as Record<string, unknown>)) {
          if (next[k] !== v) {
            next[k] = v as number | null;
            changed = true;
          }
        }
        if (changed) this.pctToGoBySkill = next;
      }
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
          // Silent reset: 2026-05-23 we renamed pctToNextBySkill →
          // pctToGoBySkill because the in-game wording is "% to go". The
          // numbers stored under the old key are now meaningless (would
          // be silently treated as their complement under the new
          // formula). Drop them so the user simply re-enters from the
          // in-game display next time they open the skill-loss expander.
          const obsolete = (this as unknown as Record<string, unknown>).pctToNextBySkill;
          if (obsolete !== undefined) {
            delete (this as unknown as Record<string, unknown>).pctToNextBySkill;
          }
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
        showAllSkills: this.showAllSkills,
        adventurersLost: this.adventurersLost,
        pctToGoBySkill: { ...this.pctToGoBySkill },
        staminaInput: this.staminaInput,
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
     * the per-skill "% to go" values are preserved on purpose so the user
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

    /** True if every vocation skill has a non-empty "% to go" filled in. */
    get skillLossInputsReady(): boolean {
      if (this.vocationSkills.length === 0) return false;
      for (const s of this.vocationSkills) {
        const v = this.pctToGoBySkill[s];
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
      const next = { ...this.pctToGoBySkill };
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
      this.pctToGoBySkill = next;
      this.save();
    },

    /**
     * Compute the (skill, % to go) the character would have AFTER the
     * simulated death, given the current skill level and user-typed % to
     * go. Returns null if any input is missing or no death is loaded.
     */
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

    // ---- Stamina mini-calc -------------------------------------------------

    /**
     * Parse the user's "HH:MM" input into a clamped total of minutes.
     * Returns null when the input is empty or invalid. Caps at 42:00 (the
     * in-game maximum) and clamps minutes to 0–59.
     */
    parseStamina(raw: string): number | null {
      const trimmed = (raw ?? "").trim();
      if (!trimmed) return null;
      // Accept "HH:MM" or just "HH". Reject anything else cleanly.
      const m = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
      if (!m) return null;
      const hours = Math.max(0, Math.min(42, parseInt(m[1], 10) || 0));
      const minutes = Math.max(0, Math.min(59, parseInt(m[2] ?? "0", 10) || 0));
      // 42:01..42:59 collapses to exactly 42:00 — there's no stamina above 42h.
      if (hours === 42) return 42 * 60;
      return hours * 60 + minutes;
    },

    /**
     * Offline minutes needed to refill from `currentMinutes` to 42:00.
     * Regen ratios per TibiaWiki Stamina:
     *   below 39:00 (white)      → 3 min offline = 1 min stamina
     *   39:00–42:00 (green/bonus) → 6 min offline = 1 min stamina
     * Stamina only starts regenerating after the character has been
     * logged off for an initial 10-minute window, so that delay is added
     * to the result whenever any regen is needed at all.
     *
     * Sanity check (wiki example): 39:00 → 42:00 = 3h of green = 180 × 6
     * = 1080 min + 10 min initial = 1090 min = 18h 10m. ✓
     */
    offlineMinutesToFull(currentMinutes: number): number {
      const MAX = 42 * 60;
      const GREEN_START = 39 * 60;
      const INITIAL_DELAY = 10;
      if (currentMinutes >= MAX) return 0;
      let regen: number;
      if (currentMinutes >= GREEN_START) {
        regen = (MAX - currentMinutes) * 6;
      } else {
        const whiteOffline = (GREEN_START - currentMinutes) * 3;
        const greenOffline = (MAX - GREEN_START) * 6; // always 180 × 6 = 1080
        regen = whiteOffline + greenOffline;
      }
      return regen + INITIAL_DELAY;
    },

    /** Human-readable "Xd Yh Zm" formatter for offline-time-to-full. */
    formatOfflineTime(minutes: number): string {
      if (minutes <= 0) return "Already at 42:00";
      const days = Math.floor(minutes / (24 * 60));
      const hours = Math.floor((minutes % (24 * 60)) / 60);
      const mins = minutes % 60;
      const parts: string[] = [];
      if (days) parts.push(`${days}d`);
      if (hours || days) parts.push(`${hours}h`);
      parts.push(`${mins}m`);
      return parts.join(" ");
    },

    /** Reactive: the time-to-42 string the template binds to. */
    get staminaTimeToMax(): string {
      const cur = this.parseStamina(this.staminaInput);
      if (cur == null) return "";
      return this.formatOfflineTime(this.offlineMinutesToFull(cur));
    },

    /**
     * Auto-formatter for the stamina input. Strips non-digits, caps at
     * 4 digits, and auto-inserts the ":" after the second digit so the
     * user can type "4159" and see "41:59". Clamping to valid in-game
     * ranges (≤42:00) happens on blur in onStaminaChange().
     */
    formatStaminaInput(raw: string): string {
      const digits = (raw ?? "").replace(/\D/g, "").slice(0, 4);
      if (digits.length === 0) return "";
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    },

    /**
     * Called on blur / Enter — clamps the input to a valid HH:MM in the
     * 00:00–42:00 range and normalises display (zero-pads). Saves so the
     * value survives page reloads.
     */
    onStaminaChange() {
      const parsed = this.parseStamina(this.staminaInput);
      if (parsed == null) {
        this.staminaInput = "";
      } else {
        const hh = Math.floor(parsed / 60);
        const mm = parsed % 60;
        this.staminaInput = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      }
      this.save();
    },

    simulateDeath() {
      const lvl = Number(this.level) || 0;
      if (lvl < 2) return;

      const beforeExp = Number(this.experience) || 0;
      const beforeBless = [...this.blessings];
      const beforeRegular = this.regularBlessingsActive;
      const beforeTof = this.hasTwistOfFate;
      const beforeLevel = lvl;

      // Skull selector was removed (most players know what red/black skull
      // implies in-game; the UI focuses on PvE — the dominant case). The
      // computeDeath function still accepts a deathType, so we just hardcode
      // PvE here.
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
  };
}
