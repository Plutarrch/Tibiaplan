/**
 * Rashid's daily city rotation. Rashid moves at server save (10:00
 * Europe/Berlin) every day of the week. Pure date computation, no API.
 *
 * Source: TibiaWiki — Rashid (city by weekday is a stable, well-known
 * fact since the NPC exists; CipSoft has never changed the rotation).
 */

interface RashidStop {
  city: string;
  /** Wiki URL slug for the city — used for the click-through link. */
  wikiSlug: string;
}

// Day-of-week index per JS Date: 0 = Sunday … 6 = Saturday.
// Rotation is anchored to Tibia's server save time (Europe/Berlin 10:00).
// Source: https://tibia.fandom.com/wiki/Rashid
const RASHID_BY_WEEKDAY: readonly RashidStop[] = [
  { city: "Carlin",      wikiSlug: "Carlin" },         // Sun
  { city: "Svargrond",   wikiSlug: "Svargrond" },      // Mon
  { city: "Liberty Bay", wikiSlug: "Liberty_Bay" },    // Tue
  { city: "Port Hope",   wikiSlug: "Port_Hope" },      // Wed
  { city: "Ankrahmun",   wikiSlug: "Ankrahmun" },      // Thu
  { city: "Darashia",    wikiSlug: "Darashia" },       // Fri
  { city: "Edron",       wikiSlug: "Edron" },          // Sat
];

/** Returns the current weekday index (0..6) at 10:00 Europe/Berlin. Pre-10:00
 *  the weekday is still "yesterday's" Rashid because the NPC moves at SS. */
function tibiaWeekday(now: Date = new Date()): number {
  // Reduce "now" to wall-clock time in Berlin.
  const berlinNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const dow = berlinNow.getDay();
  const hour = berlinNow.getHours();
  // Before 10am the rotation hasn't flipped yet — back up one day.
  return hour < 10 ? (dow + 6) % 7 : dow;
}

// Singleton timer (see boostedToday.ts for the rationale).
let activeInstance: ReturnType<typeof rashidLocation> | null = null;
let timerInstalled = false;
function installTimer() {
  if (timerInstalled || typeof window === "undefined") return;
  timerInstalled = true;
  window.setInterval(() => activeInstance?.refresh(), 60_000);
}

export function rashidLocation() {
  return {
    city: "" as string,
    wikiUrl: "" as string,

    init(this: ReturnType<typeof rashidLocation>) {
      installTimer();
      activeInstance = this;
      this.refresh();
    },

    refresh(this: ReturnType<typeof rashidLocation>) {
      const stop = RASHID_BY_WEEKDAY[tibiaWeekday()];
      this.city = stop.city;
      this.wikiUrl = `https://tibia.fandom.com/wiki/${stop.wikiSlug}`;
    },
  };
}
