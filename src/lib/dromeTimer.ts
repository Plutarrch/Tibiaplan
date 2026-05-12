/**
 * Tibia Drome reset countdown.
 *
 * The Drome resets every 14 days at server save (10:00 Europe/Berlin). To
 * compute the next reset we anchor on a KNOWN past reset and add multiples
 * of 14 days until we're in the future.
 *
 * TODO — verify DROME_ANCHOR_UTC against HakaiMarket or tibia.com once it's
 * deployed. If the countdown shown to users is off by a few days, adjust
 * this constant to ANY known reset moment (must be a Tuesday 10:00 in
 * Europe/Berlin time, expressed here as the equivalent UTC instant).
 */

// CET (winter) = UTC+1, CEST (summer) = UTC+2. May falls in CEST, so 10:00
// Europe/Berlin = 08:00 UTC. Anchor synced against HakaiMarket on
// 2026-05-12: their countdown of 1d 2h 8m at that moment puts the next
// reset at 2026-05-13 08:00 UTC (a Wednesday). Cycle = 14 days back to
// 2026-04-29 (also Wed). Note: user reported "cada 2 martes" but the
// CEST 10:00 reset actually lands on Wednesday in UTC frame.
const DROME_ANCHOR_UTC = "2026-04-29T08:00:00Z";
const PERIOD_MS = 14 * 24 * 60 * 60 * 1000;

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function nextDromeReset(now: Date = new Date()): Date {
  const anchorMs = new Date(DROME_ANCHOR_UTC).getTime();
  const diff = now.getTime() - anchorMs;
  // Number of completed periods since the anchor (rounded down). The next
  // reset is the anchor plus (cycles+1) periods.
  const cycles = Math.floor(diff / PERIOD_MS);
  return new Date(anchorMs + (cycles + 1) * PERIOD_MS);
}

function formatCountdown(ms: number): Countdown {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const seconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

export function dromeTimer() {
  return {
    nextReset: "" as string,
    countdown: "" as string,
    _timer: 0 as number,

    init(this: ReturnType<typeof dromeTimer>) {
      this.refresh();
      // Tick every minute — sub-minute precision in the UI would just churn
      // DOM with no real value.
      this._timer = window.setInterval(() => this.refresh(), 60_000);
    },

    destroy(this: ReturnType<typeof dromeTimer>) {
      if (this._timer) clearInterval(this._timer);
    },

    refresh(this: ReturnType<typeof dromeTimer>) {
      const next = nextDromeReset();
      this.nextReset = next.toISOString();
      const c = formatCountdown(next.getTime() - Date.now());
      // "8d 14h 22m" — drop zero leading units for compactness.
      const parts: string[] = [];
      if (c.days) parts.push(`${c.days}d`);
      if (c.days || c.hours) parts.push(`${c.hours}h`);
      parts.push(`${c.minutes}m`);
      this.countdown = parts.join(" ");
    },
  };
}
