/**
 * Character Sheet — trimmed down 2026-09-23.
 *
 * All death-simulator-adjacent state (promotion, blessings, skull,
 * skills, per-skill "% to go", lastDeath, revive) moved out to
 * `deathSimulator.ts` which now lives on the /guides/tibia-death-penalty
 * guide page. What remains here is the character identity + share-XP
 * + stamina mini-calc.
 *
 * The singleton bus + `character:updated` event stay in place even
 * though nobody currently listens to them — cheap to keep, and useful
 * the moment Character Search "Use as profile" (or anything similar)
 * needs to sync a name/level/vocation into this sheet again.
 */

// (No formula imports needed after the Experience field was removed —
//  Level is a plain input, and share range is arithmetic on Level only.)

const STORAGE_KEY = "tibiaplanner.character";
const RESET_EVENT = "app:reset";
const UPDATED_EVENT = "character:updated";

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
  level: number | null;
  /**
   * Current stamina as a raw "HH:MM" string typed by the user. Capped
   * at 42:00 (the in-game maximum). The mini-calc reads this and
   * outputs the offline time needed to reach 42:00.
   */
  staminaInput: string;
}

function defaults(): PersistedCharacter {
  return {
    name: "",
    vocation: "",
    level: null,
    staminaInput: "",
  };
}

export function characterSheet() {
  return {
    ...defaults(),

    init() {
      installBus();
      activeInstance = this;
      this.load();
    },

    /**
     * Mirror external `character:updated` writes into local state
     * without re-saving (writer already persisted, so re-saving would
     * ping-pong the event). Reserved for future integrations —
     * currently nothing dispatches this event but the plumbing is
     * cheap to keep alive.
     */
    _onCharacterUpdated(detail: unknown) {
      if (!detail || typeof detail !== "object") return;
      const d = detail as Record<string, unknown>;
      if (typeof d.name === "string") this.name = d.name;
      if (typeof d.vocation === "string") this.vocation = d.vocation;
      if (d.level !== undefined) this.level = d.level as number | null;
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          // Merge over defaults so missing keys fall back gracefully.
          // Old saves carried a lot of extra keys (promotion, blessings,
          // skills, pctToGoBySkill, adventurersLost, showAllSkills);
          // they're harmless to leave in `data` — Object.assign only
          // copies keys we still declare on `this` via defaults().
          Object.assign(this, defaults(), pickKnownKeys(data));
        }
      } catch {
        // Ignore corrupted storage; fall through to defaults.
      }
    },

    save() {
      const snapshot: PersistedCharacter = {
        name: this.name,
        vocation: this.vocation,
        level: this.level,
        staminaInput: this.staminaInput,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // localStorage may be full or unavailable in private mode — ignore.
      }
      // Same-tab reactivity: 'storage' events don't fire for own writes,
      // so we broadcast a custom event for anything that wants to sync
      // off the character identity (nobody today, kept for the future).
      window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: snapshot }));
    },

    reset() {
      Object.assign(this, defaults());
      this.save();
    },

    // ---- Derived values ------------------------------------------------

    /** Tibia exp-share range: ceil(level * 2/3) to floor(level * 3/2). */
    get shareRange(): { min: number; max: number } | null {
      if (!this.level) return null;
      return {
        min: Math.ceil(this.level * (2 / 3)),
        max: Math.floor(this.level * (3 / 2)),
      };
    },

    // ---- Stamina mini-calc --------------------------------------------

    /**
     * Parse the user's "HH:MM" input into a clamped total of minutes.
     * Returns null when the input is empty or invalid. Caps at 42:00
     * (in-game maximum) and clamps minutes to 0–59.
     */
    parseStamina(raw: string): number | null {
      const trimmed = (raw ?? "").trim();
      if (!trimmed) return null;
      // Accept "HH:MM" or just "HH". Reject anything else cleanly.
      const m = trimmed.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
      if (!m) return null;
      const hours = Math.max(0, Math.min(42, parseInt(m[1], 10) || 0));
      const minutes = Math.max(0, Math.min(59, parseInt(m[2] ?? "0", 10) || 0));
      // 42:01..42:59 collapses to 42:00 — no stamina above 42h.
      if (hours === 42) return 42 * 60;
      return hours * 60 + minutes;
    },

    /**
     * Offline minutes needed to refill from `currentMinutes` to 42:00.
     * Regen ratios per TibiaWiki Stamina:
     *   below 39:00 (white)       → 3 min offline = 1 min stamina
     *   39:00–42:00 (green/bonus) → 6 min offline = 1 min stamina
     * Stamina only starts regenerating after the character has been
     * logged off for an initial 10-minute window, so that delay is
     * added to the result whenever any regen is needed at all.
     *
     * Wiki sanity check: 39:00 → 42:00 = 3h of green = 180 × 6 = 1080
     * + 10 min initial = 1090 min = 18h 10m. ✓
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

    /** "Xd Yh Zm" formatter for the mini-calc output. */
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
     * user can type "4159" and see "41:59". Clamping happens on blur.
     */
    formatStaminaInput(raw: string): string {
      const digits = (raw ?? "").replace(/\D/g, "").slice(0, 4);
      if (digits.length === 0) return "";
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    },

    /**
     * Blur / Enter handler — clamps to a valid HH:MM in 00:00–42:00 and
     * zero-pads on the way out. Saves so the value survives reloads.
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
  };
}

/**
 * Filter a raw loaded object down to the keys we still recognise. Old
 * saves carry legacy fields (blessings, skills, pctToGoBySkill,
 * showAllSkills, promotion, adventurersLost); returning them via
 * Object.assign would silently re-add them to `this`, which we don't
 * want.
 */
function pickKnownKeys(data: unknown): Partial<PersistedCharacter> {
  if (!data || typeof data !== "object") return {};
  const d = data as Record<string, unknown>;
  const out: Partial<PersistedCharacter> = {};
  if (typeof d.name === "string") out.name = d.name;
  if (typeof d.vocation === "string") out.vocation = d.vocation;
  if (typeof d.level === "number" || d.level === null) out.level = d.level as number | null;
  if (typeof d.staminaInput === "string") out.staminaInput = d.staminaInput;
  return out;
}
