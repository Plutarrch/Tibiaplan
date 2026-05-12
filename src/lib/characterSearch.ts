/**
 * Character Search tab — looks up a Tibia character via the Tibia Stalker
 * public API and shows the primary character data plus probable hidden
 * alts (probabilistic correlation from world-online snapshots).
 *
 * Source / attribution:
 *   API:    https://api.tibiastalker.pl
 *   Docs:   https://github.com/TibiaStalker/tibiastalker-api
 *   Method: World-online snapshots every 5 min for months/years; if two
 *           characters consistently overlap or alternate sessions on the
 *           same world they're flagged as probable alts. Cannot detect
 *           characters that were ALWAYS account-hidden — only those that
 *           were visible at some point.
 *
 * Caching: 5-minute localStorage TTL per character name. Matches the API's
 * scan cycle so we never have data more stale than the upstream itself.
 */

const STORAGE_PREFIX = "tibiaplanner.charsearch.";
const CACHE_TTL_MS = 5 * 60 * 1000;
const API_BASE = "https://api.tibiastalker.pl/api/tibia-stalker/v1";
const UPDATED_EVENT = "character:updated"; // shared with characterSheet

interface InvisibleMatch {
  otherCharacterName: string;
  numberOfMatches: number;
  firstMatchDateOnly: string;
  lastMatchDateOnly: string;
}

interface VisibleMatch {
  otherCharacterName: string;
}

interface CharacterResult {
  name: string;
  world: string;
  vocation: string;
  level: number;
  lastLogin: string | null;
  formerNames: string[];
  formerWorlds: string[];
  traded: boolean;
  otherVisibleCharacters: VisibleMatch[];
  possibleInvisibleCharacters: InvisibleMatch[];
}

interface CacheEntry {
  fetchedAt: number;
  data: CharacterResult;
}

function cacheKey(name: string): string {
  return STORAGE_PREFIX + name.trim().toLowerCase();
}

function readCache(name: string): CharacterResult | null {
  try {
    const raw = localStorage.getItem(cacheKey(name));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(name: string, data: CharacterResult): void {
  try {
    const entry: CacheEntry = { fetchedAt: Date.now(), data };
    localStorage.setItem(cacheKey(name), JSON.stringify(entry));
  } catch {
    // ignore quota / disabled storage
  }
}

/** Map a Tibia Stalker vocation string to a TibiaPlan vocation key. The
 *  API returns the promoted name (e.g. "Royal Paladin"); we strip the
 *  promo prefix so it matches the lowercase keys in src/data/skills.ts. */
function normalizeVocation(v: string): { key: string | null; promoted: boolean } {
  const lower = v.toLowerCase().trim();
  // Promoted prefixes per CipSoft.
  const promoMap: Array<{ test: RegExp; base: string }> = [
    { test: /^elite knight\b/, base: "knight" },
    { test: /^royal paladin\b/, base: "paladin" },
    { test: /^master sorcerer\b/, base: "sorcerer" },
    { test: /^elder druid\b/, base: "druid" },
    { test: /^exalted monk\b/, base: "monk" },
    { test: /^knight\b/, base: "knight" },
    { test: /^paladin\b/, base: "paladin" },
    { test: /^sorcerer\b/, base: "sorcerer" },
    { test: /^druid\b/, base: "druid" },
    { test: /^monk\b/, base: "monk" },
  ];
  for (const { test, base } of promoMap) {
    if (test.test(lower)) {
      const promoted = !lower.startsWith(base);
      return { key: base, promoted };
    }
  }
  return { key: null, promoted: false };
}

export function characterSearch() {
  return {
    query: "" as string,
    loading: false as boolean,
    error: "" as string,
    result: null as CharacterResult | null,

    init() {
      // No persistence on the input — fresh start each visit, but cached
      // results survive (so re-typing a recent name is instant).
    },

    async search(this: ReturnType<typeof characterSearch>) {
      const name = this.query.trim();
      if (!name) {
        this.error = "Type a character name";
        return;
      }
      // Tibia char names: letters + spaces + apostrophes. Length 2-29.
      if (!/^[A-Za-z' ]{2,29}$/.test(name)) {
        this.error = "Invalid character name format";
        return;
      }
      this.error = "";
      this.loading = true;
      this.result = null;

      const cached = readCache(name);
      if (cached) {
        this.result = cached;
        this.loading = false;
        return;
      }

      try {
        const res = await fetch(
          `${API_BASE}/characters/${encodeURIComponent(name)}`,
        );
        if (res.status === 404) {
          this.error = `Character "${name}" not found`;
          this.loading = false;
          return;
        }
        if (!res.ok) {
          throw new Error(`API ${res.status}`);
        }
        const data = (await res.json()) as CharacterResult;
        // Defensive defaults — the API can return null for some fields.
        data.formerNames = data.formerNames ?? [];
        data.formerWorlds = data.formerWorlds ?? [];
        data.otherVisibleCharacters = data.otherVisibleCharacters ?? [];
        data.possibleInvisibleCharacters = data.possibleInvisibleCharacters ?? [];
        writeCache(name, data);
        this.result = data;
      } catch (err) {
        this.error = "Couldn't reach Tibia Stalker. Try again in a moment.";
        console.warn("CharacterSearch fetch failed", err);
      } finally {
        this.loading = false;
      }
    },

    /** Look up one of the alts shown in the result (click-to-pivot UX). */
    searchAlt(this: ReturnType<typeof characterSearch>, name: string) {
      this.query = name;
      this.search();
    },

    /** Friendly relative "last seen" string. Returns "" if no lastLogin. */
    lastSeen(this: ReturnType<typeof characterSearch>): string {
      const ts = this.result?.lastLogin;
      if (!ts) return "";
      const then = new Date(ts).getTime();
      if (isNaN(then)) return "";
      const diffMs = Date.now() - then;
      const min = Math.floor(diffMs / 60_000);
      if (min < 5) return "Online or just logged out";
      if (min < 60) return `${min} min ago`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h ago`;
      const day = Math.floor(hr / 24);
      if (day < 30) return `${day}d ago`;
      const mo = Math.floor(day / 30);
      if (mo < 12) return `${mo}mo ago`;
      return `${Math.floor(mo / 12)}y ago`;
    },

    /** Bucket the confidence of a probable-alt match for color-coding. */
    confidenceBucket(matches: number): "high" | "medium" | "low" {
      if (matches >= 30) return "high";
      if (matches >= 10) return "medium";
      return "low";
    },

    /** Push the searched character into the Character Sheet (name + level
     *  + vocation + promotion). Skips silently if the API vocation can't
     *  be mapped to a TibiaPlan vocation key (e.g. unknown promo title). */
    useAsProfile(this: ReturnType<typeof characterSearch>) {
      if (!this.result) return;
      const { key, promoted } = normalizeVocation(this.result.vocation);
      if (!key) {
        this.error = "Couldn't auto-fill — vocation not recognised";
        return;
      }
      const fields = {
        name: this.result.name,
        vocation: key,
        promotion: promoted,
        level: this.result.level,
      };
      // Persist the merge so a page reload keeps the imported character.
      try {
        const raw = localStorage.getItem("tibiaplanner.character");
        const current = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          "tibiaplanner.character",
          JSON.stringify({ ...current, ...fields }),
        );
      } catch {
        // continue even if storage is full — the live event below still works
      }
      // Notify the Character Sheet to mirror the fields into its in-memory
      // state immediately (no page reload needed).
      window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: fields }));
      this.error = "";
    },
  };
}
