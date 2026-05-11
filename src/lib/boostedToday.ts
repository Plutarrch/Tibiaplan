/**
 * Boosted-today widget: shows today's boosted creature + boosted boss with
 * a countdown to the next rotation (Tibia server save = 10:00 Europe/Berlin).
 *
 * Data comes from TibiaData.com — the community-maintained API that scrapes
 * tibia.com (free, CORS-open, used by every major fansite). Cached in
 * localStorage for an hour so we don't hit the API on every page view.
 */

const STORAGE_KEY = "tibiaplanner.boosted";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
// Verified shapes (queried 2026-05-10):
//   /v4/creatures        → { creatures: { boosted: { name, race, image_url, featured }, creature_list: [...] } }
//   /v4/boostablebosses  → { boostable_bosses: { boosted: { name, image_url, featured }, boostable_boss_list: [...] } }
const CREATURES_URL = "https://api.tibiadata.com/v4/creatures";
const BOSSES_URL = "https://api.tibiadata.com/v4/boostablebosses";

interface BoostedEntry {
  name: string;
  image: string;
}

interface CachedBoosted {
  fetchedAt: number;
  creature: BoostedEntry;
  boss: BoostedEntry;
}

interface DisplayEntry extends BoostedEntry {
  wikiUrl: string;
}

function wikiUrlFor(name: string): string {
  // TibiaWiki uses underscores for spaces and is case-sensitive on the first
  // letter only — the API name format already matches. encodeURIComponent
  // handles the rest (e.g. apostrophes in "Mr. Punish's Servant").
  return `https://tibia.fandom.com/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
}

function emptyEntry(): DisplayEntry {
  return { name: "", image: "", wikiUrl: "" };
}

function readCache(): CachedBoosted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBoosted;
    if (!parsed.fetchedAt || Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    if (!parsed.creature?.name || !parsed.boss?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(data: CachedBoosted): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage disabled or full — silently skip
  }
}

/** Time until next 10:00 Europe/Berlin (Tibia server save).
 *  Returns null if computation fails (shouldn't happen but defensive). */
function timeUntilServerSave(): { hours: number; minutes: number } | null {
  try {
    // Build "now in Berlin" by formatting through the timezone — this
    // automatically handles DST (CEST in summer, CET in winter).
    const now = new Date();
    const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
    const target = new Date(berlinNow);
    target.setHours(10, 0, 0, 0);
    if (berlinNow >= target) target.setDate(target.getDate() + 1);
    const ms = target.getTime() - berlinNow.getTime();
    if (ms <= 0) return null;
    return {
      hours: Math.floor(ms / 3_600_000),
      minutes: Math.floor((ms % 3_600_000) / 60_000),
    };
  } catch {
    return null;
  }
}

export function boostedToday() {
  return {
    creature: emptyEntry() as DisplayEntry,
    boss: emptyEntry() as DisplayEntry,
    countdown: "" as string,
    ready: false as boolean,
    _timer: 0 as number,

    init(this: ReturnType<typeof boostedToday>) {
      this.refreshCountdown();
      this.load();
      // Update the countdown once per minute. When it ticks past 0 the
      // load() inside refreshCountdown re-fetches the API.
      this._timer = window.setInterval(() => this.refreshCountdown(), 60_000);
    },

    destroy(this: ReturnType<typeof boostedToday>) {
      if (this._timer) clearInterval(this._timer);
    },

    async load(this: ReturnType<typeof boostedToday>) {
      const cached = readCache();
      if (cached) {
        this.apply(cached);
        return;
      }
      try {
        const [creaturesJson, bossesJson] = await Promise.all([
          fetch(CREATURES_URL).then((r) => r.json()),
          fetch(BOSSES_URL).then((r) => r.json()),
        ]);
        const cRaw = creaturesJson?.creatures?.boosted ?? null;
        const bRaw = bossesJson?.boostable_bosses?.boosted ?? null;
        if (!cRaw?.name || !bRaw?.name) {
          throw new Error("Unexpected TibiaData response shape");
        }
        const data: CachedBoosted = {
          fetchedAt: Date.now(),
          creature: { name: cRaw.name, image: cRaw.image_url ?? "" },
          boss: { name: bRaw.name, image: bRaw.image_url ?? "" },
        };
        writeCache(data);
        this.apply(data);
      } catch (err) {
        // Fail silent — widget stays hidden via `ready === false`
        console.warn("BoostedToday: API fetch failed", err);
      }
    },

    apply(this: ReturnType<typeof boostedToday>, data: CachedBoosted) {
      this.creature = {
        name: data.creature.name,
        image: data.creature.image,
        wikiUrl: wikiUrlFor(data.creature.name),
      };
      this.boss = {
        name: data.boss.name,
        image: data.boss.image,
        wikiUrl: wikiUrlFor(data.boss.name),
      };
      this.ready = true;
    },

    refreshCountdown(this: ReturnType<typeof boostedToday>) {
      const t = timeUntilServerSave();
      if (!t) {
        this.countdown = "";
        return;
      }
      this.countdown = `${t.hours}h ${t.minutes}m`;
      // Within the last minute before rotation, invalidate the cache and
      // refetch so we pick up the new pair as soon as it lands.
      if (t.hours === 0 && t.minutes <= 1) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
        this.load();
      }
    },
  };
}
