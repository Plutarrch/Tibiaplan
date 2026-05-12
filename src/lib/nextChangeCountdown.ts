/**
 * Server-save countdown shared between BoostedToday, Rashid, and any other
 * widget that rotates at 10:00 Europe/Berlin. Kept as its own Alpine
 * component so the "Next change" pill can sit at the END of the header
 * group (after Creature / Boss / Rashid) — all three rotate together.
 *
 * BoostedToday still computes its own internal countdown (it uses the
 * near-zero edge to invalidate its localStorage cache and refetch the
 * new boosted pair). This component is presentational only.
 */

function timeUntilServerSave(): { hours: number; minutes: number } | null {
  try {
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

export function nextChangeCountdown() {
  return {
    countdown: "" as string,
    _timer: 0 as number,

    init(this: ReturnType<typeof nextChangeCountdown>) {
      this.refresh();
      this._timer = window.setInterval(() => this.refresh(), 60_000);
    },

    destroy(this: ReturnType<typeof nextChangeCountdown>) {
      if (this._timer) clearInterval(this._timer);
    },

    refresh(this: ReturnType<typeof nextChangeCountdown>) {
      const t = timeUntilServerSave();
      this.countdown = t ? `${t.hours}h ${t.minutes}m` : "";
    },
  };
}
