/**
 * Parser for Tibia's Party Hunt Analyzer log + settlement algorithm.
 *
 * Tibia's "Copy to Clipboard" output uses inconsistent whitespace between
 * fields — sometimes newlines, sometimes tabs, sometimes plain spaces (and
 * any chat or copy/paste hop along the way may collapse one into another).
 *
 * Our strategy is to first NORMALIZE: insert a newline before every known
 * field marker (Loot:, Supplies:, ...). After that, every line is at most
 * one stat plus optionally a trailing player name (which appears on the
 * same line when Tibia used a space instead of a tab/newline as separator).
 */

export interface PlayerStats {
  name: string;
  loot: number;
  supplies: number;
  balance: number;
  damage: number;
  healing: number;
}

export interface Hunt {
  duration: string;          // "02:00h"
  durationMinutes: number;   // 120
  totalLoot: number;
  totalSupplies: number;
  totalBalance: number;
  totalDamage: number;
  totalHealing: number;
  players: PlayerStats[];
}

export interface Transfer {
  from: string;
  to: string;
  amount: number;
}

const SESSION_RE = /^Session:\s*(\d+):(\d+)h/i;
const SESSION_DATA_RE = /^Session data:/i;
const LOOT_TYPE_RE = /^Loot Type:/i;

/**
 * Insert a newline whenever a known field marker appears preceded by
 * whitespace. The `\s+` consumes the preceding tab/space/newline so we don't
 * end up with double newlines.
 */
const NORMALIZE_RE =
  /\s+(?=(?:Session data:|Session:|Loot Type:|Damage\/h:|Healing\/h:|Loot:|Supplies:|Balance:|Damage:|Healing:))/gi;

/**
 * Numeric stat line: "Key: value" optionally followed by trailing text. The
 * trailing text, when present, is the next player's name (which got stuck
 * on the same line because the upstream format used a space separator).
 */
const NUMERIC_STAT_RE =
  /^(Loot|Supplies|Balance|Damage|Healing|Damage\/h|Healing\/h):\s*(-?[\d,]+)\s*(.*)?$/i;

function parseAmount(s: string): number {
  return parseInt(s.replace(/,/g, ""), 10) || 0;
}

/** Strip trailing "(Leader)", "(Member)", etc. suffixes from a player name. */
function cleanName(raw: string): string {
  return raw.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function parseHuntLog(raw: string): Hunt | null {
  if (!raw || !raw.trim()) return null;

  const lines = raw
    .replace(/ /g, " ") // normalize NBSP
    .replace(NORMALIZE_RE, "\n")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  let session = "";
  let durationMinutes = 0;
  let totalLoot = 0;
  let totalSupplies = 0;
  let totalBalance = 0;
  let totalDamage = 0;
  let totalHealing = 0;

  const players: PlayerStats[] = [];
  let currentPlayer: PlayerStats | null = null;

  const startPlayer = (rawName: string) => {
    if (currentPlayer) players.push(currentPlayer);
    currentPlayer = {
      name: cleanName(rawName),
      loot: 0,
      supplies: 0,
      balance: 0,
      damage: 0,
      healing: 0,
    };
  };

  for (const line of lines) {
    // Session duration
    const sm = line.match(SESSION_RE);
    if (sm) {
      const h = +sm[1];
      const m = +sm[2];
      session = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}h`;
      durationMinutes = h * 60 + m;
      continue;
    }

    if (SESSION_DATA_RE.test(line)) continue;
    if (LOOT_TYPE_RE.test(line)) continue;

    // "Key: value [trailing player name]"
    const statMatch = line.match(NUMERIC_STAT_RE);
    if (statMatch) {
      const key = statMatch[1].toLowerCase();
      const val = parseAmount(statMatch[2]);
      const trailing = (statMatch[3] || "").trim();

      if (currentPlayer) {
        if (key === "loot") currentPlayer.loot = val;
        else if (key === "supplies") currentPlayer.supplies = val;
        else if (key === "balance") currentPlayer.balance = val;
        else if (key === "damage") currentPlayer.damage = val;
        else if (key === "healing") currentPlayer.healing = val;
        // /h variants on a player line shouldn't happen.
      } else {
        if (key === "loot") totalLoot = val;
        else if (key === "supplies") totalSupplies = val;
        else if (key === "balance") totalBalance = val;
        else if (key === "damage") totalDamage = val;
        else if (key === "healing") totalHealing = val;
        // Damage/h, Healing/h: ignore — derivable.
      }

      if (trailing) startPlayer(trailing);
      continue;
    }

    // A bare line that isn't a recognized stat = a player name on its own
    // line (the older "name then indented stats" multi-line format).
    startPlayer(line);
  }

  if (currentPlayer) players.push(currentPlayer);
  if (players.length === 0) return null;

  return {
    duration: session,
    durationMinutes,
    totalLoot,
    totalSupplies,
    totalBalance,
    totalDamage,
    totalHealing,
    players,
  };
}

/**
 * Settlement: split totalBalance evenly. Players with positive surplus pay
 * those with negative surplus. We greedily match the largest surplus to the
 * largest deficit on each step so we minimize the number of transfers.
 *
 * Amounts are rounded to whole gp at the end of each match — Tibia gold is
 * integer, and floating drift up to ±1 gp is acceptable for splits.
 */
export function computeTransfers(players: PlayerStats[]): Transfer[] {
  if (players.length < 2) return [];

  const total = players.reduce((sum, p) => sum + p.balance, 0);
  const perPerson = total / players.length;

  const owers = players
    .map((p) => ({ name: p.name, diff: p.balance - perPerson }))
    .filter((p) => p.diff > 0)
    .sort((a, b) => b.diff - a.diff);

  const owees = players
    .map((p) => ({ name: p.name, diff: p.balance - perPerson }))
    .filter((p) => p.diff < 0)
    .sort((a, b) => a.diff - b.diff); // most negative first

  const transfers: Transfer[] = [];
  let oi = 0;

  for (const ower of owers) {
    while (ower.diff > 0.5 && oi < owees.length) {
      const owee = owees[oi];
      const amount = Math.min(ower.diff, -owee.diff);
      const rounded = Math.round(amount);
      if (rounded > 0) {
        transfers.push({ from: ower.name, to: owee.name, amount: rounded });
      }
      ower.diff -= amount;
      owee.diff += amount;
      if (owee.diff >= -0.5) oi++;
    }
  }

  return transfers;
}

