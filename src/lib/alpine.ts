import Alpine from "alpinejs";
import { boostedToday } from "./boostedToday";
import { characterSheet } from "./characterSheet";
import { imbuementsTab } from "./imbuementsTab";
import { lootTab } from "./lootTab";
import { tabsControl } from "./tabsControl";
import { trainingTab } from "./trainingTab";

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}

Alpine.data("characterSheet", characterSheet);
Alpine.data("trainingTab", trainingTab);
Alpine.data("lootTab", lootTab);
Alpine.data("imbuementsTab", imbuementsTab);
Alpine.data("tabsControl", tabsControl);
Alpine.data("boostedToday", boostedToday);

window.Alpine = Alpine;
Alpine.start();
