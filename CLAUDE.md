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
   - Blessings (7 colored squares, clickable)
   - Skull selector (No skull / White / Red / Black) — defaults to No skull
   - Sprite placeholder (CSS divs, no real Tibia sprites yet)
   - "Simulate Death" button (red gradient)
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

### Death loss (approximate, refine with TibiaPal source if needed)
```js
// PvE base loss: 10% of current level's exp
// Each blessing reduces ~11.4% of loss (max ~80% reduction with all 7)
const blessReduction = (blessingsActive / 7) * 0.8;
const lossPct = 0.10 * (1 - blessReduction);
const expLost = expFor(currentLevel) * lossPct;
```

### Twist of Fate logic
- PvE death with Twist of Fate active: keep 1 blessing (7 → 1)
- PvP death (any skull): lose all blessings including Twist of Fate (7 → 0)

### Backpack drop warning
- If active blessings < 5: show warning that backpack and equipped items may drop on death

### Training: charges per skill point (approximation, refine if you find better data)
```js
function chargesPerSkillPoint(skill, current) {
  const base = (skill === 'Magic level') ? 1500 : 80;
  const safeLevel = Math.max(0, Math.min(120, Math.floor(current) - 10));
  return Math.round(base * Math.pow(1.05, safeLevel));
}
```

### Exercise weapons stats
```
Exercise: 500 charges,    25,000 gp NPC price
Durable:  1,800 charges,  75,000 gp NPC price
Lasting:  14,400 charges, 540,000 gp NPC price, 1.1x rate bonus
```

### Tibia Coin threshold
- Above 13,900 gp per TC: buy weapons with gold
- Below: buy directly from Tibia Store (cheaper)

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
  monk:     ['Magic level', 'Fist fighting', 'Shielding']
};

const ALL_SKILLS = ['Magic level', 'Sword', 'Axe', 'Club', 'Distance', 'Shielding', 'Fist fighting', 'Fishing'];
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
    { name: 'Knock',     sub: 'Fist fighting' }
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

**Single global store via localStorage**:
```js
{
  character: {
    name: '',
    vocation: '',
    promotion: false,
    level: null,
    experience: null,
    skills: { /* skill name -> value */ },
    blessings: [true,true,true,true,true,true,true],
    skull: 'none'
  },
  training: {
    skill: '',
    currentSkill: null,
    pctToNext: null,
    targetSkill: null,
    doubleEvent: false,
    privateDummy: false,
    selectedWeapon: null
  },
  lootSplit: {
    history: []  // max 15 entries
  },
  ui: {
    activeTab: 'training',
    showAllSkills: false
  }
}
```

**Reset action** must clear ALL of the above and reset to defaults (skull: 'none', blessings all true, no character data).

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

- [ ] Verify exact charges-per-skill-point formula from TibiaPal `/scripts/exercise.js` and `/scripts/offlinetraining.js`
- [ ] Verify Imbuement ingredient lists for Damage and Protection imbuements
- [ ] Confirm Twist of Fate logic edge cases
- [ ] Decide final domain name and logo (placeholder: "YourTibiaSite" with gradient "T" mark)
- [ ] Source for sprites (Phase 5+): apply to Tibia fansite program

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
