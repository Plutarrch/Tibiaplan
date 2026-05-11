import {
  IMBUEMENT_CATEGORIES,
  IMBUE_GOLD_FEE,
  IMBUE_GOLD_TOKENS,
  TIERS,
  type Imbuement,
  type Tier,
} from "../data/imbuements";

const STORAGE_KEY = "tibiaplanner.imbuements";
const RESET_EVENT = "app:reset";

interface PersistedImbuements {
  /** Per-imbuement-name selected tier (defaults to "powerful" — the most-asked-about). */
  selectedTier: Record<string, Tier>;
}

function defaults(): PersistedImbuements {
  return { selectedTier: {} };
}

export function imbuementsTab() {
  return {
    // Static data exposed to templates.
    CATEGORIES: IMBUEMENT_CATEGORIES,
    TIERS,
    GOLD_FEE: IMBUE_GOLD_FEE,
    GOLD_TOKENS: IMBUE_GOLD_TOKENS,

    // Persisted UI state.
    selectedTier: {} as Record<string, Tier>,

    init() {
      this.load();
      window.addEventListener(RESET_EVENT, () => this.reset());
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data === "object" && data.selectedTier) {
          this.selectedTier = { ...data.selectedTier };
        }
      } catch {
        // ignore
      }
    },

    save() {
      try {
        const snapshot: PersistedImbuements = { selectedTier: { ...this.selectedTier } };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    reset() {
      Object.assign(this, defaults());
      this.save();
    },

    /** Default to "powerful" since that's what most players actually craft. */
    tierFor(imb: Imbuement): Tier {
      return this.selectedTier[imb.name] ?? "powerful";
    },

    setTier(imb: Imbuement, tier: Tier) {
      this.selectedTier = { ...this.selectedTier, [imb.name]: tier };
      this.save();
    },

    // ---- Display helpers ----

    /**
     * Display label for tier buttons. We keep the internal data keys as
     * basic/intricate/powerful for clarity in the source, but show "Tier 1/2/3"
     * to the user — shorter, fits the buttons cleanly, and reads as a
     * progression scale.
     */
    tierLabel(tier: Tier): string {
      switch (tier) {
        case "basic":     return "Tier 1";
        case "intricate": return "Tier 2";
        case "powerful":  return "Tier 3";
      }
    },

    /** Format a gp number with thousands separators. */
    formatGold(gp: number): string {
      if (!Number.isFinite(gp) || gp <= 0) return "0";
      return Math.round(gp).toLocaleString();
    },

    /**
     * Compact "60k gp" / "250k gp" / "7.5k gp" notation. Matches the in-game
     * shorthand most Tibia players use when discussing imbue costs.
     */
    formatGoldShort(gp: number): string {
      if (!Number.isFinite(gp) || gp <= 0) return "0";
      if (gp >= 1_000_000) {
        const v = gp / 1_000_000;
        return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)}kk`;
      }
      if (gp >= 1000) {
        const v = gp / 1000;
        return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}k`;
      }
      return `${gp}`;
    },

    /** Total ingredient quantity across the selected tier (for the card sub-header). */
    totalIngredients(imb: Imbuement, tier: Tier): number {
      return imb.ingredients[tier].reduce((sum, i) => sum + i.qty, 0);
    },
  };
}
