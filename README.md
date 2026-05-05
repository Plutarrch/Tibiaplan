# Tibia Helper Site

A fast, mobile-friendly helper site for the MMORPG **Tibia**. Calculators and tools that share a single Character Profile, so you don't re-enter your data every time.

## Features

- **Character Profile** — Set your vocation, level, skills, and blessings once. All tools auto-fill from this.
- **Training Calculator** — See exactly what % of the next skill level you'll end at after using exercise weapons. (Other sites only tell you the final integer skill — we tell you the decimal.)
- **Loot Split** — Paste your Party Hunt Analyzer log, get a clean list of who pays whom. Hunt history saved automatically.
- **Imbuements Reference** — Ingredients, prices, and tier comparison for all imbuements.
- **Death Simulator** — See exactly what you'd lose on death given your current setup.

## Stack

Astro + Alpine.js + Tailwind CSS, hosted on Cloudflare Pages.

Performance target: Lighthouse >95 on throttled 3G. First-load bundle <100KB.

## Local development

```bash
npm install
npm run dev
```

## Disclaimer

Tibia and all related sprites, names, and assets are © CipSoft GmbH. This is an unofficial fansite. We are not affiliated with or endorsed by CipSoft.

## License

MIT for code. Tibia game data and any sprites used remain property of CipSoft GmbH.
