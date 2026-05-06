import {
  computeTransfers,
  parseHuntLog,
  type Hunt,
  type Transfer,
} from "./lootSplit";

const STORAGE_KEY = "tibiaplanner.loot";
const RESET_EVENT = "app:reset";
const MAX_HISTORY = 15;

interface SavedHunt {
  rawLog: string;
  hunt: Hunt;
  transfers: Transfer[];
  savedAt: number;
}

interface PersistedLoot {
  rawLog: string;
  history: SavedHunt[];
  historyOpen: boolean;
}

function defaults(): PersistedLoot {
  return { rawLog: "", history: [], historyOpen: true };
}

export function lootTab() {
  return {
    rawLog: "" as string,
    history: [] as SavedHunt[],
    historyOpen: true as boolean,
    currentHunt: null as Hunt | null,
    transfers: [] as Transfer[],
    parseError: "" as string,
    copied: false as boolean,
    copiedLog: false as boolean,
    copiedIndex: -1 as number,
    copiedLogIndex: -1 as number,
    /** Raw log of the hunt currently displayed (kept after we clear the textarea). */
    currentRawLog: "" as string,

    init() {
      this.load();
      window.addEventListener(RESET_EVENT, () => this.reset());
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          this.rawLog = typeof data.rawLog === "string" ? data.rawLog : "";
          this.history = Array.isArray(data.history)
            ? data.history.slice(0, MAX_HISTORY)
            : [];
          this.historyOpen =
            typeof data.historyOpen === "boolean" ? data.historyOpen : true;
        }
      } catch {
        // ignore
      }
    },

    save() {
      const snapshot: PersistedLoot = {
        rawLog: this.rawLog,
        history: this.history.slice(0, MAX_HISTORY),
        historyOpen: this.historyOpen,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    reset() {
      const d = defaults();
      this.rawLog = d.rawLog;
      this.history = d.history;
      this.historyOpen = d.historyOpen;
      this.currentHunt = null;
      this.currentRawLog = "";
      this.transfers = [];
      this.parseError = "";
      this.copied = false;
      this.copiedLog = false;
      this.copiedIndex = -1;
      this.copiedLogIndex = -1;
      this.save();
    },

    toggleHistoryOpen() {
      if (this.history.length === 0) return;
      this.historyOpen = !this.historyOpen;
      this.save();
    },

    closeHistory() {
      this.historyOpen = false;
      this.save();
    },

    calculate() {
      this.parseError = "";
      const hunt = parseHuntLog(this.rawLog);
      if (!hunt) {
        this.parseError =
          "Couldn't parse the log. Paste the full Party Hunt Analyzer output (Session, totals, and one block per player).";
        this.currentHunt = null;
        this.transfers = [];
        return;
      }
      if (hunt.players.length < 2) {
        this.parseError =
          "Loot split needs at least 2 players. Only one player block was detected.";
        this.currentHunt = hunt;
        this.transfers = [];
        return;
      }

      const transfers = computeTransfers(hunt.players);
      this.currentHunt = hunt;
      this.transfers = transfers;
      this.currentRawLog = this.rawLog;

      // Auto-save to history (newest first; cap at MAX_HISTORY).
      const entry: SavedHunt = {
        rawLog: this.rawLog,
        hunt,
        transfers,
        savedAt: Date.now(),
      };
      this.history.unshift(entry);
      if (this.history.length > MAX_HISTORY) {
        this.history.length = MAX_HISTORY;
      }

      // Empty the textarea now that the log is saved into history.
      this.rawLog = "";
      // Surface the freshly-saved hunt by auto-opening the history sidebar.
      this.historyOpen = true;
      this.save();
    },

    clearLog() {
      this.rawLog = "";
      this.currentHunt = null;
      this.currentRawLog = "";
      this.transfers = [];
      this.parseError = "";
      this.save();
    },

    loadHunt(index: number) {
      const entry = this.history[index];
      if (!entry) return;
      this.rawLog = entry.rawLog;
      this.currentRawLog = entry.rawLog;
      this.currentHunt = entry.hunt;
      this.transfers = entry.transfers;
      this.parseError = "";
      this.save();
      try {
        document
          .getElementById("loot-log")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        // ignore
      }
    },

    deleteHunt(index: number) {
      this.history.splice(index, 1);
      const shift = (i: number) =>
        i === index ? -1 : i > index ? i - 1 : i;
      this.copiedIndex = shift(this.copiedIndex);
      this.copiedLogIndex = shift(this.copiedLogIndex);
      this.save();
    },

    formatNumber(n: number): string {
      if (!Number.isFinite(n)) return "0";
      return Math.round(n).toLocaleString();
    },

    /**
     * Round a gp amount to a single "k / kk / kkk" unit (no decimals) for
     * the Discord summary block. Mirrors TibiaPal's display style.
     */
    formatRoundK(gp: number): string {
      if (!Number.isFinite(gp)) return "0";
      const abs = Math.abs(gp);
      if (abs < 1000) return `${Math.round(gp)}`;
      if (abs < 1_000_000) return `${Math.round(gp / 1000)}k`;
      if (abs < 1_000_000_000) return `${Math.round(gp / 1_000_000)}kk`;
      return `${Math.round(gp / 1_000_000_000)}kkk`;
    },

    /**
     * Plain-text summary built for Discord: transfers list (exact gp), then
     * a per-player + per-hour profit block in rounded "k" notation.
     *
     * Pass explicit args to build a summary for a hunt out of the history
     * list without having to load it into the calculator first.
     */
    buildDiscordSummary(hunt?: Hunt | null, transfers?: Transfer[]): string {
      const h = hunt ?? this.currentHunt;
      const ts = transfers ?? this.transfers;
      if (!h) return "";

      const fmt = (n: number) => this.formatNumber(n);
      const k = (n: number) => this.formatRoundK(n);
      const lines: string[] = ["Transfers"];

      if (ts.length > 0) {
        const sorted = [...ts].sort((a, b) => b.amount - a.amount);
        for (const t of sorted) {
          lines.push(`- ${t.from} pays ${fmt(t.amount)} gp to ${t.to}`);
        }
      } else {
        lines.push("All players had a fair share — no transfers needed.");
      }

      const perPerson =
        h.players.length > 0 ? h.totalBalance / h.players.length : 0;
      lines.push(
        `Total profit: ${k(h.totalBalance)} which is: ${k(perPerson)} for each player.`,
      );

      const hours = h.durationMinutes > 0 ? h.durationMinutes / 60 : 0;
      if (hours > 0) {
        const perHour = perPerson / hours;
        const dur = h.duration || "—";
        lines.push(
          `Session duration: ${dur}, which is: ${k(perHour)} for each player per hour.`,
        );
      }

      return lines.join("\n");
    },

    _writeToClipboard(text: string, onSuccess: () => void) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(onSuccess)
          .catch(() => {
            if (this._legacyCopy(text)) onSuccess();
          });
      } else if (this._legacyCopy(text)) {
        onSuccess();
      }
    },

    copyToDiscord() {
      const text = this.buildDiscordSummary();
      if (!text) return;
      this._writeToClipboard(text, () => {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      });
    },

    copyOriginalLog() {
      const text = this.currentRawLog;
      if (!text) return;
      this._writeToClipboard(text, () => {
        this.copiedLog = true;
        setTimeout(() => {
          this.copiedLog = false;
        }, 2000);
      });
    },

    copyHuntFromHistory(index: number) {
      const saved = this.history[index];
      if (!saved) return;
      const text = this.buildDiscordSummary(saved.hunt, saved.transfers);
      if (!text) return;
      this._writeToClipboard(text, () => {
        this.copiedIndex = index;
        setTimeout(() => {
          if (this.copiedIndex === index) this.copiedIndex = -1;
        }, 2000);
      });
    },

    copyHuntLogFromHistory(index: number) {
      const saved = this.history[index];
      if (!saved?.rawLog) return;
      this._writeToClipboard(saved.rawLog, () => {
        this.copiedLogIndex = index;
        setTimeout(() => {
          if (this.copiedLogIndex === index) this.copiedLogIndex = -1;
        }, 2000);
      });
    },

    _legacyCopy(text: string): boolean {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    },
  };
}
