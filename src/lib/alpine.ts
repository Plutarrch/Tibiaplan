import Alpine from "alpinejs";
import { boostedToday } from "./boostedToday";
import { characterSearch } from "./characterSearch";
import { characterSheet } from "./characterSheet";
import { dromeTimer } from "./dromeTimer";
import { imbuementsTab } from "./imbuementsTab";
import { lootTab } from "./lootTab";
import { nextChangeCountdown } from "./nextChangeCountdown";
import { offlineTrainingTab } from "./offlineTrainingTab";
import { rashidLocation } from "./rashidLocation";
import { tabsControl } from "./tabsControl";
import { trainingTab } from "./trainingTab";

declare global {
  interface Window {
    Alpine: typeof Alpine;
  }
}

Alpine.data("characterSheet", characterSheet);
Alpine.data("trainingTab", trainingTab);
Alpine.data("offlineTrainingTab", offlineTrainingTab);
Alpine.data("lootTab", lootTab);
Alpine.data("imbuementsTab", imbuementsTab);
Alpine.data("tabsControl", tabsControl);
Alpine.data("boostedToday", boostedToday);
Alpine.data("characterSearch", characterSearch);
Alpine.data("rashidLocation", rashidLocation);
Alpine.data("dromeTimer", dromeTimer);
Alpine.data("nextChangeCountdown", nextChangeCountdown);

window.Alpine = Alpine;

let alpineStarted = false;
document.addEventListener("astro:page-load", () => {
  if (!alpineStarted) {
    Alpine.start();
    alpineStarted = true;
  } else {
    Alpine.initTree(document.body);
  }
});
