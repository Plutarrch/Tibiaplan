const STORAGE_KEY = "tibiaplanner.activeTab";
const RESET_EVENT = "app:reset";

export type Tab = "training" | "loot" | "imbuements" | "character-search";

const VALID_TABS: readonly Tab[] = ["training", "loot", "imbuements", "character-search"];

export function tabsControl() {
  return {
    active: "training" as Tab,

    init() {
      // Hash takes precedence so deep-links like /#imbuements work.
      const fromHash = window.location.hash.replace(/^#/, "") as Tab;
      if (VALID_TABS.includes(fromHash)) {
        this.active = fromHash;
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY) as Tab | null;
          if (saved && VALID_TABS.includes(saved)) this.active = saved;
        } catch {
          // ignore
        }
      }

      window.addEventListener(RESET_EVENT, () => {
        this.active = "training";
        this.save();
      });
    },

    setActive(tab: Tab) {
      if (!VALID_TABS.includes(tab)) return;
      this.active = tab;
      this.save();
      // Mirror to URL hash so reload + share keeps the tab.
      try {
        history.replaceState(null, "", `#${tab}`);
      } catch {
        // ignore
      }
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, this.active);
      } catch {
        // ignore
      }
    },
  };
}
