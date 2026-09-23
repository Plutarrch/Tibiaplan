/**
 * Wrapper Alpine module that lets the user open up to 3 Training
 * Calculator slots at once. Each slot is a fully independent calc
 * (own vocation, own skill, own inputs, own results) — the point is
 * to compare training plans across different characters at a glance.
 *
 * Typical use case: a player with a Paladin + a Monk + a Druid wants
 * to see how long each one would take to level a chosen skill, side
 * by side, without cycling through the same calc three times.
 *
 * Persistence:
 *   tibiaplanner.training.slots → JSON array of active slot IDs, e.g.
 *   ["primary", "slot-2"]. The individual slot state lives under
 *   tibiaplanner.training (primary) and tibiaplanner.training.<id>.
 */

const STORAGE_KEY = "tibiaplanner.training.slots";
const RESET_EVENT = "app:reset";
const SLOT_REMOVED_EVENT = "training-slot:remove";

/** Max simultaneous slots. 3 covers "paladin + monk + druid" comparisons
 *  which is the realistic upper bound; more would just clutter the UI. */
export const MAX_SLOTS = 3;

/** All the possible slot IDs the user can activate. Order matters —
 *  addSlot() picks the first unused one, so activation is deterministic. */
const POSSIBLE_SLOTS = ["primary", "slot-2", "slot-3"] as const;

let activeInstance: ReturnType<typeof trainingSlots> | null = null;
let busInstalled = false;
function installBus() {
  if (busInstalled || typeof window === "undefined") return;
  busInstalled = true;
  window.addEventListener(RESET_EVENT, () => {
    activeInstance?.reset();
  });
  window.addEventListener(SLOT_REMOVED_EVENT, (e: Event) => {
    const detail = (e as CustomEvent).detail as { slotId?: string } | undefined;
    if (detail?.slotId) activeInstance?.removeSlot(detail.slotId);
  });
}

interface PersistedSlots {
  slots: string[];
}

function defaults(): PersistedSlots {
  return { slots: ["primary"] };
}

export function trainingSlots() {
  return {
    slots: ["primary"] as string[],
    MAX_SLOTS,

    init() {
      installBus();
      activeInstance = this;
      this.load();
      // Defensive: "primary" must always be present. If somebody edited
      // localStorage by hand or the shape drifted, restore the invariant.
      if (!this.slots.includes("primary")) {
        this.slots = ["primary", ...this.slots.filter((s) => s !== "primary")];
        this.save();
      }
    },

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.slots)) {
          // Only keep known slot IDs — protects against stale data
          // pointing at slots we've since removed from POSSIBLE_SLOTS.
          this.slots = data.slots.filter((s: unknown): s is string =>
            typeof s === "string" && (POSSIBLE_SLOTS as readonly string[]).includes(s),
          );
        }
      } catch {
        // ignore
      }
    },

    save() {
      try {
        const snapshot: PersistedSlots = { slots: [...this.slots] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // ignore
      }
    },

    reset() {
      this.slots = ["primary"];
      this.save();
    },

    /** Add the next unused slot ID. No-op if already at MAX_SLOTS. */
    addSlot() {
      if (this.slots.length >= MAX_SLOTS) return;
      const next = POSSIBLE_SLOTS.find((s) => !this.slots.includes(s));
      if (!next) return;
      this.slots = [...this.slots, next];
      this.save();
    },

    /** Remove a slot by ID. Cannot remove "primary" — always visible. */
    removeSlot(slotId: string) {
      if (slotId === "primary") return;
      if (!this.slots.includes(slotId)) return;
      this.slots = this.slots.filter((s) => s !== slotId);
      // Wipe that slot's own localStorage so if the user re-adds it
      // later it starts blank instead of surfacing stale numbers.
      try {
        localStorage.removeItem(`tibiaplanner.training.${slotId}`);
      } catch {
        // ignore
      }
      this.save();
    },

    // ---- Computed ----

    get canAddMore(): boolean {
      return this.slots.length < MAX_SLOTS;
    },

    /** Is a particular slot ID currently active? Used by the template
     *  to decide which slot cards should be visible. */
    isSlotActive(slotId: string): boolean {
      return this.slots.includes(slotId);
    },
  };
}
