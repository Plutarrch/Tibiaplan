# CLAUDE.md — Tibia Helper Site

This file provides comprehensive context to Claude Code when working on this project. Read it carefully before making changes.

---

## Project philosophy: patient, lean, owner-operated

This is a **long-term side project** built and maintained by a single person who genuinely cares about Tibia. The pace is whatever the developer can sustain — there are no deadlines, no investors, no validation timelines, no abandon-if-X triggers.

**The only commitment is to keep it cheap and keep it shipping.**

### Spending rules (non-negotiable)

| Item | When to spend | Cost |
|---|---|---|
| Domain | Day one | ~$10/year |
| Hosting | Always | $0 (Cloudflare Pages free tier covers this forever) |
| Anything else | Only when free tier is genuinely outgrown | $0 until proven necessary |

**No AdSense application until 5,000 visits/day** (~150k/month). Reasoning: AdSense at low traffic adds friction, slows the site, looks unprofessional, and generates near-zero revenue. The site stays clean and fast for as long as possible. Featured Resellers (direct deals) come even later — only after a real audience exists and a reseller approaches us, not before.

**No paid ads, no boosted posts, no influencer payments.** Growth is 100% organic forever. If we can't earn an audience by being genuinely better than TibiaPal in our niche, we don't deserve one.

### Time philosophy

The developer has a day job (RFP automation at WWI). This project gets evenings and weekends, irregularly. **A "good week" might be 2 hours of work; a "bad month" might be zero hours.** That's fine. The site doesn't disappear if no one touches it for 8 weeks.

When working, prioritize:
1. **Don't break what already works** (the live site is sacred)
2. **Ship something visible to users** (even small polish > big invisible refactor)
3. **Keep the codebase boring** (future-you, returning after 3 months away, must understand it)

Reject:
- Big rewrites
- Speculative abstractions
- Frameworks that need constant updates
- Anything that adds operational burden

---

## Project overview

A web-based helper site for the MMORPG **Tibia**, in the same category as TibiaPal.com. Target audience: Latin American players (heavy Venezuelan + Brazilian + Mexican base), often on slow connections and older PCs. Performance is critical.

**Positioning**: We are a **planificador** (planner), not just a calculator. The differentiator is a **Character Profile** that all tools share — calculators autocomplete from your character data, so you don't re-enter info every time.

**The signature feature**: A training calculator that tells you exactly what % of the next skill level you'll end at — something TibiaPal does NOT do. Players currently have to do this math in their head. We make it visual and obvious.

**The geographic angle**: TibiaPal's traffic is mostly Brazil (Portuguese). The Spanish-speaking LATAM market (Venezuela, Mexico, Argentina, Chile, Spain) is underserved. The site is built English-first for SEO reach, but Spanish translation is a planned later-phase feature once the core works.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** (with islands) | Static HTML by default, JS only on interactive parts. Bundle ~30KB, not 300KB. |
| Interactivity | **Alpine.js** + vanilla JS | Lightweight reactivity without React overhead |
| Styling | **Tailwind CSS** (compiled, ~15KB) | Fast iteration, no UI libraries needed |
| Hosting | **Cloudflare Pages** | Free forever for our scale, edge in LATAM, automatic SSL, generous limits |
| Domain registrar | **Cloudflare Registrar** | At-cost (~$9.15/year for .com), no markup |
| Storage | **localStorage** | No login required, instant persistence, $0 |
| Analytics | **Cloudflare Web Analytics** | Free, privacy-friendly, no cookies, no GDPR headaches |
| Fonts | **System font stack** | No web fonts, saves 50KB + round-trip |

**Performance budget (NON-NEGOTIABLE)**:
- First-load JS+CSS combined: **<100KB**
- Lighthouse Performance: **>95 on throttled 3G**
- Works on Android Go and 2010-era PCs

**Things explicitly forbidden**:
- React/Vue/Svelte for the whole site (Astro islands only when needed)
- Web fonts (use system stack)
- Framer Motion or heavy animation libs (CSS transitions only)
- Google Analytics (use Cloudflare Web Analytics — free, lighter, no cookies)
- shadcn/ui or any component library (build the few components needed by hand)
- Decorative images (icons inline as SVG)
- Any paid service or SaaS — if it costs money, find a free alternative or skip it

---

## Visual design system

**Theme**: Dark, premium gaming feel (Mobalytics-inspired)

**Colors**:
```
Background primary:   #0E0E18
Background surface:   #181724
Background sunken:    #0F0E18
Border subtle:        #2A2939
Border emphasis:      #5C5A78

Text primary:         #E8E6F0
Text secondary:       #8A87A3
Text tertiary:        #5C5A78

Accent violet:        #9B8AFB  (primary brand color, used for selected/active states)
Accent cyan:          #5DCAE8  (secondary, gradients with violet)
Gold (prices):        #FFD166
Success green:        #6FE7B7
Danger red:           #E24B4A  (Simulate Death button uses gradient #B53A3A → #791F1F)
```

**Critical visual rule**: ALL selectable/active buttons use the same violet styling:
```css
background: #9B8AFB;
color: #0E0E18;
border-color: #9B8AFB;
box-shadow: 0 0 0 2px rgba(155, 138, 251, 0.4);
font-weight: 500;
```

This applies to:
- Skull buttons when selected (PvP status)
- Private Dummy / Double Exp checkboxes when checked
- Imbuement tier buttons (Basic/Intricate/Powerful) when active
- Weapon cards (Exercise/Durable/Lasting) when selected
- Active main tab (Training/Loot Split/Imbuements)

**Typography**: System font stack (no web fonts). Sizes: 10px (labels), 11px (body), 12-13px (subheaders), 14-18px (titles).

**Spacing**: Generous padding (24px on main character sheet card). Cards have 0.5px borders, 6-8px border-radius.

**No emojis** in UI (project owner preference). Use unicode symbols sparingly: ↻ (reset), ♥ (donate placeholder), ⚠ (warning), → (transfer arrow).

---

## Build order (when you're ready, no rush)

This is the suggested build order. Don't feel pressured to do it all at once. Each phase is shippable on its own.

### Phase 1 — Foundation (essential, build first)

1. **Project setup** — Astro + Tailwind + Alpine.js + Cloudflare Pages deploy working
2. **Layout shell** — Header (logo placeholder + Reset button), main grid, sidebar (placeholder boxes for future ads, NOT live ads), footer with CipSoft attribution
3. **Character Sheet component** with localStorage persistence:
   - Name input, vocation dropdown, Promotion checkbox
   - Level + Experience (bidirectional sync via Tibia formula)
   - Skills section (filtered by vocation, "Show more" toggle)
   - Blessings: **lvl 1-20** shows a single "Adventurer's Blessing" box (free, PvP-only protection); **lvl 21+** shows **8 squares** = 7 regular blessings + Twist of Fate
   - Skull selector (No skull / White / Red / Black) — defaults to No skull
   - Sprite placeholder (CSS divs, no real Tibia sprites yet)
   - "Simulate Death" button (red gradient) — reads the selected skull to pick the death type (PvE / White / Red / Black) and applies the **exact** TibiaWiki formulas
   - Death summary table (Level / Total exp / Regular bless / Twist of Fate, before → after) with a "Want to know skill exp loss?" expansion that asks for "% to next" per vocation skill and computes the new skill state
   - "Revive" button (green gradient) appears below Simulate Death after a death — restores exp/level/blessings but preserves skill levels and "% to next" inputs
4. **Reset button** in header that clears EVERYTHING (character, training inputs, loot split, hunt history)

After Phase 1: site looks complete but only the character sheet works. **You can ship this.** Cloudflare Pages auto-deploys.

### Phase 2 — Training Calculator (the signature feature)

5. **Training Tab** — the killer feature:
   - Inputs: Skill to train, Current skill, % to next level (0.01 step), Target skill (max 200)
   - Modifiers: Double Exp/Skill event, Private dummy
   - Output: 3 weapon cards (Exercise/Durable/Lasting) with weapons needed, time, cost, **end at skill X at Y.YY%**
   - Final position progress bar
   - Recommendation message (which weapon is best)
   - Auto-fills "Current skill" from Character Sheet skills

After Phase 2: the site has its differentiator. **Quietly soft-launch** — share it once in r/TibiaMMO, see what people say, iterate on feedback.

### Phase 3 — Loot Split (table stakes for credibility)

6. **Loot Split Tab**:
   - Textarea for Hunt Analyzer log
   - Parser extracts each player's Loot/Supplies/Balance/Damage/Healing
   - Algorithm: total balance / num players = per person; diff = balance − per person; positives pay negatives
   - Output: list of transfers ("X pays Y gp to Z")
   - Hunt history (saved as "Hunt 1: 3 players · Total 48,964 gp · 02:00h", max 15)
   - Click history entry to reload that log

After Phase 3: site has parity with TibiaPal's most-used tool, plus our differentiator. Now we have a real reason for people to switch.

### Phase 4 — Imbuements (frequently searched, low maintenance)

7. **Imbuements Reference Tab**:
   - 3 sections: Utility (Vampirism/Void/Strike), Damage Skills (Slash/Chop/Bash/Precision/Epiphany/Knock), Protection (Dragon Hide/Frost/Reflection/Lich Shroud/Snake Skin/Lethargy)
   - Each card: name + sub-name, sprite placeholder, 3 tier buttons, ingredient list, NPC price
   - Click tier → updates ingredients and price (10k/25k/250k gp)

After Phase 4: MVP is feature-complete. Site can stay like this indefinitely while traffic grows.

### Phase 5+ — Whatever interests you next

Pick whichever excites you most when you have time. None of these are urgent. Suggested order:
- Spanish translation (i18n) — captures the underserved LATAM market
- Bestiary reference
- Real Tibia sprites (apply for fansite program first — see Legal section)
- Hunting places guide
- Outfit customization

### Features explicitly EXCLUDED (don't build these)

- Login / accounts (localStorage is enough, login adds friction)
- Bless calculator (no value, blessings have fixed prices)
- Imbue cost calculator separately (the Imbuements Reference replaces it)
- Equipment guide / Quest guide (high maintenance, low ROI for solo dev)
- Killer level penalty in PvP (too complex, simplify to PvE/PvP)

---

## Critical formulas (verified)

### Experience per level
```js
function expFor(n) {
  return n < 2 ? 0 : Math.round((50/3) * (n*n*n - 6*n*n + 17*n - 12));
}
```

### Exp share range
```js
const minLevel = Math.ceil(level * 2/3);
const maxLevel = Math.floor(level * 3/2);
```

### Death loss (EXACT — TibiaWiki Death page, verified)

Sources: https://tibia.fandom.com/wiki/Death · https://tibia.fandom.com/wiki/Blessings · https://tibia.fandom.com/wiki/Twist_of_Fate · https://tibia.fandom.com/wiki/Adventurer%27s_Blessing · https://tibia.fandom.com/wiki/Skull_System

**Maximum experience loss before reductions:**
```js
// Level 1-23: flat 10% of total accumulated exp.
// Level 24+:  ((x+50)/100) * 50 * (x² − 5x + 8)  where x = current level
function maxExperienceLoss(level, totalExp) {
  if (level <= 23) return totalExp * 0.10;
  return ((level + 50) / 100) * 50 * (level * level - 5 * level + 8);
}
```

**Reductions are ADDITIVE (NOT multiplicative):**
```js
// Promotion: −30%. Each regular blessing: −8%. Twist of Fate does NOT reduce.
// Maximum reduction with all 7 regular blessings + promotion = 86%.
factor = max(0, 1 − regularBlessings * 0.08 − (promoted ? 0.30 : 0));
expLost = maxExperienceLoss * factor;
```

Skill loss + spent-mana loss use the **same percentage** as exp loss applied
to the player's accumulated skill tries (verified by TibiaWiki + tibia.com
news/944 + mathiasbynens' calculations on r/TibiaMMO matching to the gp).

### Adventurer's Blessing (lvl 1-20, free)
- Granted automatically at character creation
- Active while `level >= 1 && level <= 20`
- **PvP-only protection**: 100% — no exp/skill/item loss on PvP death
- Does **NOT** protect PvE death — at low levels the 10% rule still applies
- Lost permanently on (a) reaching level 21 the first time, or (b) attacking another player first

### Twist of Fate behavior
- Does **NOT** reduce experience or skill loss directly
- Does **NOT** prevent equipment drop on its own
- On a **PvE** death: regular blessings are consumed; ToF stays
- On a **PvP** death (no skull / white skull):
  - With ToF + regular blessings → only ToF is consumed; regulars survive
  - With ToF + AoL but no regulars → only ToF is consumed; AoL survives
  - With ToF only (no regulars, no AoL) → ToF is preserved (nothing to protect)

### Item Loss table (TibiaWiki Death — graduated by regular-blessing count)

| Regular bless | Container drop | Per-equipped-item drop |
|---|---|---|
| 0 | 100% | 10% |
| 1 | 70%  | 7% |
| 2 | 45%  | 4.5% |
| 3 | 25%  | 2.5% |
| 4 | 10%  | 1% |
| 5+ | 0%  | 0% |

Twist of Fate doesn't count toward item-drop protection.

### Skull behavior on death

| Skull | Items | Regular bless | Twist of Fate | AoL |
|---|---|---|---|---|
| **None / White** | Use Item Loss table | Stay if ToF protects, else lost | Consumed first if there's something to protect | Stays |
| **Red** | ALL drop | All lost | **Stays** (TibiaWiki Skull System) | Lost |
| **Black** | ALL drop | All lost | Lost | Lost |

Black skull also revives at temple with 40 HP and 0 mana.

**Out of scope (intentional):** Unfair Fight reduction (PvP where killers' total levels > victim) and Retro Hardcore PvP modifiers.

### Exercise weapons stats (verified — TibiaWiki Exercise_Weapon)

| Type | Charges | Mana points | Use time | NPC price (gp) | Store price (TC) |
|---|---|---|---|---|---|
| Exercise (regular) | 500    |   300,000 | 16m 40s | 347,222    | 25  |
| Durable Exercise   | 1,800  | 1,080,000 | 1h      | 1,250,000  | 90  |
| Lasting Exercise   | 14,400 | 8,640,000 | 8h      | 10,000,000 | 720 |

- Lasting = exactly 8× Durable (NO 1.1x rate bonus — that was a myth in older docs)
- Training weapons (50 charges, free, on-tile only) are excluded from the calculator: they can't be bought
- All vocations progress their main skill at the same rate per mana point on these weapons (vocation constant baked into the points-per-skill-level formula)

### Tibia Coin threshold (in code: `TC_THRESHOLD_GP = 14000`)
- Above 14,000 gp per TC: buy weapons with gold (NPC, paying gp directly)
- Below 14,000 gp per TC: buy directly from Tibia Store with TC (cheaper)

### Loot Split algorithm (formula from TibiaPal/TibiaMaps)
```js
// 1. Parse log to extract each player's Loot, Supplies, Balance, Damage, Healing
// 2. totalBalance = sum of all player balances
// 3. perPerson = totalBalance / numberOfPlayers
// 4. For each player: diff = playerBalance - perPerson
//    - Positive diff: player owes this much (got more than fair share)
//    - Negative diff: player is owed this much
// 5. Settlement: sort owers descending, owees descending
//    - Each ower pays the largest owee until ower's debt = 0
//    - Move to next ower, repeat
// 6. Output: list of transfers "X should pay N gp to Y"
```

---

## Skills by vocation

```js
const SKILLS_BY_VOCATION = {
  knight:   ['Magic level', 'Shielding', 'Sword', 'Axe', 'Club'],
  paladin:  ['Magic level', 'Distance', 'Shielding'],
  sorcerer: ['Magic level', 'Shielding'],
  druid:    ['Magic level', 'Shielding'],
  monk:     ['Magic level', 'Fist', 'Shielding']
};

const ALL_SKILLS = ['Magic level', 'Sword', 'Axe', 'Club', 'Distance', 'Shielding', 'Fist', 'Fishing'];
// Fishing only shown when "Show more" is toggled
```

---

## Imbuement data

```js
const IMBUEMENTS = {
  utility: [
    { name: 'Vampirism', sub: 'Life Leech',
      basic:     [['Vampire Teeth', 25]],
      intricate: [['Vampire Teeth', 25], ['Bloody Pincers', 15]],
      powerful:  [['Vampire Teeth', 25], ['Bloody Pincers', 15], ['Dead Snake', 5]] },
    { name: 'Void', sub: 'Mana Leech',
      basic:     [['Rope Belts', 25]],
      intricate: [['Rope Belts', 25], ['Silencer Claws', 15]],
      powerful:  [['Rope Belts', 25], ['Silencer Claws', 15], ['Grimeleech Wings', 5]] },
    { name: 'Strike', sub: 'Critical',
      basic:     [['Cyclops Toes', 20]],
      intricate: [['Cyclops Toes', 25], ['Vexclaws', 15]],
      powerful:  [['Cyclops Toes', 25], ['Vexclaws', 15], ['Cobra Tongues', 5]] }
  ],
  damage: [
    { name: 'Slash',     sub: 'Sword' },
    { name: 'Chop',      sub: 'Axe' },
    { name: 'Bash',      sub: 'Club' },
    { name: 'Precision', sub: 'Distance' },
    { name: 'Epiphany',  sub: 'Magic Level' },
    { name: 'Knock',     sub: 'Fist' }
  ],
  protection: [
    { name: 'Dragon Hide', sub: 'Fire' },
    { name: 'Frost',       sub: 'Ice' },
    { name: 'Lich Shroud', sub: 'Death' },
    { name: 'Reflection',  sub: 'Energy' },
    { name: 'Snake Skin',  sub: 'Earth' },
    { name: 'Lethargy',    sub: 'Holy' }
  ]
};

const IMBUE_PRICES = { basic: '10,000', intricate: '25,000', powerful: '250,000' }; // gp
```

**TODO before Phase 4 launch**: Verify ingredient lists for damage and protection imbuements against TibiaPal data or TibiaWiki. Damage and Protection arrays above only have `name` and `sub` — need to add `basic`/`intricate`/`powerful` ingredient arrays. This can be done gradually.

---

## File structure (recommended)

```
/
├── CLAUDE.md                    (this file)
├── README.md                    (public-facing description)
├── astro.config.mjs
├── tailwind.config.cjs
├── package.json
├── .gitignore
├── src/
│   ├── pages/
│   │   └── index.astro          (the only page, all tabs in one)
│   ├── components/
│   │   ├── Header.astro
│   │   ├── CharacterSheet.astro
│   │   ├── DeathSimulator.astro (Alpine island)
│   │   ├── tabs/
│   │   │   ├── TrainingTab.astro    (Alpine island)
│   │   │   ├── LootSplitTab.astro   (Alpine island)
│   │   │   └── ImbuementsTab.astro  (Alpine island)
│   │   └── Sidebar.astro        (placeholder boxes only, no live ads)
│   ├── data/
│   │   ├── imbuements.ts        (full imbuement data)
│   │   ├── skills.ts            (skills by vocation)
│   │   └── formulas.ts          (exp, share, training, etc.)
│   ├── lib/
│   │   ├── characterStore.ts    (localStorage abstraction)
│   │   ├── lootSplit.ts         (parser + algorithm)
│   │   └── trainingCalc.ts      (training math)
│   └── styles/
│       └── global.css           (Tailwind + design tokens)
└── public/
    ├── favicon.svg
    └── sprites/                 (Phase 5+, after fansite approval)
```

**Why a single page**: SEO benefits from one canonical URL with all features. Tabs are state, not navigation. URL hash can persist the active tab (`/#training`).

---

## State management

**Stores (one localStorage key per Alpine component):**

```js
// 'tibiaplanner.character'
{
  name: '',
  vocation: '',
  promotion: false,
  level: null,
  experience: null,
  skills: { /* skill name -> value */ },
  // 8 booleans: indices 0-6 = the 7 regular blessings counted by the
  // death-penalty formula, index 7 = Twist of Fate.
  blessings: [true,true,true,true,true,true,true,true],
  skull: 'none',
  showAllSkills: false,
  // Adventurer's Blessing (auto for lvl 1-20). Toggle that simulates the
  // "I attacked first and lost it" case without manipulating the level.
  adventurersLost: false,
  // "% to next" per skill (in-game value). Shared bidirectionally with the
  // Training tab via `character:updated` events.
  pctToNextBySkill: { /* skill name -> 0..100 (2 decimals) */ }
}

// 'tibiaplanner.training'
{
  skill: '',          // empty == "Select skill" — forces dependent fields blank
  currentSkill: null,
  pctToNext: null,
  targetSkill: null,
  doubleEvent: false,
  privateDummy: false,
  loyalty: 0,
  tcOverThreshold: true,
  showResults: false
}

// 'tibiaplanner.loot'  — { rawLog, history (max 15), historyOpen }
// 'tibiaplanner.activeTab' — 'training' | 'loot' | 'imbuements'
```

**Cross-component sync:** writes to the character store dispatch a
`character:updated` CustomEvent. The Training tab listens to mirror its
local `currentSkill` and `pctToNext` for the selected skill. The Death sim
listens to mirror skill values and `pctToNextBySkill`. Loop guards skip
no-op writes.

**Ephemeral character-sheet state** (not persisted): `lastDeath` (the
before/after snapshot used by the Death summary table + Revive) and
`skillLossOpen` (collapse/expand of the skill-loss expansion).

**Reset action** must clear ALL of the above and reset to defaults
(skull: 'none', blessings all true including ToF, adventurersLost: false,
pctToNextBySkill empty, no character data).

**Migrations on load:** old saves with a 7-slot `blessings` array are
auto-migrated to the 8-slot layout (Blood of the Mountain inserted at
index 5 defaulted to `true`; ToF moves from index 6 → 7).

---

## Sidebar (no live ads, ever, until 5k visits/day)

The sidebar has **placeholder boxes** that look like ad slots but contain neutral content:
- 300×250 box: shows nothing or a small "Built with care for the Tibia community" message
- Featured Resellers card: shows nothing or a "Spot available — contact us" placeholder
- 300×200 box: shows nothing or links to our Discord (when we have one)

**Why placeholders instead of empty space**: keeps layout consistent with future ad slots, so when AdSense is finally added (at 5k visits/day, ~150k/month) the layout doesn't break.

**When to flip the switch on AdSense**:
- Hard threshold: **5,000 visits/day sustained for 30+ days**
- At that point: apply for AdSense, place code in the existing slots
- Until then: site stays clean, fast, and ad-free. This is a feature, not a sacrifice.

**Featured Resellers**: never go looking for them. Wait for them to approach us. When traffic justifies it (~30k+ visits/month), they'll find us.

---

## Legal

- Footer must include: "Tibia and all related sprites, names, and assets are © CipSoft GmbH. This is an unofficial fansite. We are not affiliated with or endorsed by CipSoft."
- **Do NOT use CipSoft sprites** until officially approved. Use placeholder CSS shapes / generic icons.
- Privacy policy required before AdSense (cookies + localStorage disclosure). Cloudflare Web Analytics doesn't need this; AdSense does.
- Apply for official Tibia fansite status when traffic justifies it (Kusnier took ~1.5 years, 5k+ visits/month threshold worked for him).

---

## Development conventions

- TypeScript everywhere (`strict: true`)
- No CSS-in-JS, only Tailwind utility classes + a small `global.css` for design tokens
- Component naming: PascalCase for files (`CharacterSheet.astro`), camelCase for functions
- All user-facing copy in **English** for now (Spanish translation is Phase 5+)
- Comments in code: English. Commit messages: English.
- No `console.log` in committed code. Use a debug flag if needed.
- Commit frequently. Push to main = auto-deploy. Embrace small commits.

---

## Testing strategy

For MVP: manual testing in Chrome + Firefox + Mobile Safari (iOS) + Chrome on Android.
Lighthouse audit before each major deploy.
Real-device testing on a low-end Android (sub-$100 phone) before public announce.

No automated tests for now. Solo dev project — tests add maintenance burden that outweighs their value at this scale. Add tests when something breaks twice in the same way.

---

## Known unknowns (TODO, no rush)

- [ ] Verify Imbuement ingredient lists for Damage and Protection imbuements (Utility list is in this doc; Damage/Protection arrays only have `name`/`sub`)
- [ ] Verify the **gp** prices listed for Imbuements (10k/25k/250k) against current TibiaWiki — those numbers are old and may have moved
- [ ] Decide final domain name and logo (placeholder: "TibiaPlan" wordmark + logo PNG already in /public)
- [ ] Source for sprites (Phase 5+): apply to Tibia fansite program
- [ ] Add Mirra image at `/public/mirra.png` for the donate page (currently a CSS placeholder)
- [ ] Consider showing the **% to next** UX label more prominently — both the Training calc and the Death-sim skill-loss table interpret it as "% completed" (in-game value), but the Training calc result still says "X% remaining → next level". Not a bug, but could be confusing for users who haven't read the labels carefully

---

## Anti-patterns to avoid

Things that have wasted time in iteration and should NOT be redone:
- Don't add a "Bless calculator" tab (excluded)
- Don't reintroduce gold/silver/blue gradient tier buttons (use violet only)
- Don't put skulls horizontally in a row (vertical column on left)
- Don't use SVG for skull buttons (use CSS divs — SVG had rendering issues)
- Don't separate Death Simulator into its own tab (it's part of Character Sheet)
- Don't show "Loot Split formula" UI (just textarea + Calculate button + result + history)
- Don't add ads, pop-ups, newsletter modals, "share to Twitter" buttons, or any other engagement growth-hacking. The site stays clean.
- Don't apply blessing/promotion reductions multiplicatively. **They are additive** per TibiaWiki: `factor = 1 − bless×0.08 − promo×0.30`. With promo + 7 bless that gives 86% reduction, not 58%.
- Don't use `<input type="number">` for decimal/float inputs. Browsers + Alpine `:value` cause cursor jumps and "100" clamping when the controlled value re-renders mid-typing. Use `type="text"` + `inputmode="decimal"` and commit on `@blur`.
- Don't put apostrophes inside Astro `<template>` text content. Use `&apos;` — the TS/JSX parser inside Alpine templates treats `'` as a string delimiter and the build breaks confusingly.
- Don't introduce a new "% remaining" vs "% completed" convention. Stick to **% completed** (matches the in-game skill display) — that's what `pointsNeeded` and `findSkillAndPctFromPoints` use today.

---

## Marketing (passive, organic, free)

The site grows by being good, not by being promoted aggressively.

**One-time soft launches** (do each ONCE, not repeatedly):
1. Single post on r/TibiaMMO when MVP feels solid — "I built this, looking for feedback"
2. Single post in TibiaPal's Discord (if their rules allow) or our own Discord if we have one
3. Single post in 1-2 LATAM Discord servers (Quintera, Antica, Yonabra) when Spanish version launches

**Ongoing organic** (zero effort):
- SEO: title tags + meta descriptions on each section, semantic HTML, fast load times, sitemap.xml. That's it.
- Word of mouth: if the site is genuinely better in its niche, players will share it.

**Never do**:
- Spam multiple subreddits with the same post
- DM Tibia streamers/YouTubers asking for shoutouts
- Buy Reddit upvotes or fake reviews
- Cross-post repeatedly with slight variations

If the site doesn't grow organically, that's information — not a reason to spam harder.

---

End of CLAUDE.md. When in doubt, prioritize: (1) performance budget, (2) the violet design rule for active states, (3) the Character Profile = single source of truth principle, (4) keep it cheap, (5) ship something visible to users.
