import Alpine from "alpinejs";
import { characterSheet } from "./characterSheet";
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
Alpine.data("tabsControl", tabsControl);

window.Alpine = Alpine;
Alpine.start();
