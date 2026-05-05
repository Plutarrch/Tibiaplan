# Initial prompt for Claude Code

Copy and paste this as your first message to Claude Code in the empty repo (after running `npm create astro@latest`).

---

## PROMPT TO PASTE

I'm starting a Tibia helper website project. Please read `CLAUDE.md` in the root directory carefully — it has the full project context, design system, formulas, and conventions.

After reading CLAUDE.md, do the following in this order:

### Step 1 — Verify environment
- Confirm Astro is installed and `npm run dev` works
- Add Tailwind CSS via `npx astro add tailwind`
- Add Alpine.js via `npm install alpinejs` and import it in a layout
- Set up TypeScript strict mode in `tsconfig.json`

### Step 2 — Create the design system
Create `src/styles/global.css` with the design tokens from CLAUDE.md (colors, typography, the critical violet active-state rule). Use CSS custom properties for the palette. Tailwind config should reference these via `theme.extend.colors`.

### Step 3 — Build the page skeleton
Create `src/pages/index.astro` with:
- `<Header />` component (logo placeholder + Reset/Discord/Donate buttons)
- A 728×90 ad placeholder div
- A 2-column grid: main content (left) + sidebar (right, 220px)
- Sidebar with 300×250 placeholder, Featured Resellers card, 300×200 placeholder
- Footer with CipSoft attribution

Don't build the Character Sheet or tabs yet — just the layout shell. I want to verify it looks right before adding interactivity.

### Step 4 — Stop and show me

After Step 3, run `npm run dev`, take a screenshot mentally of what should appear, and tell me:
1. What you built
2. What file structure looks like now
3. What you'd build next (don't build it yet)

I'll review and approve before you continue with the Character Sheet.

---

## Why this approach

I've been iterating on UI mockups in chat for too long and getting bugs from regenerating everything each time. I want to build incrementally now: foundation → layout → character sheet → one tab at a time. Each step verified before moving forward.

The CLAUDE.md file has hard-won decisions baked in. Trust it. If something seems redundant, it's there because we already tried alternatives and they failed.

---

## After Step 4 is approved

The next prompts will go in this order (don't do them yet):

1. Build `<CharacterSheet />` component with name, vocation, level/exp, skills, blessings, skulls, sprite placeholder, Simulate Death button. Wire to localStorage.

2. Build `<TrainingTab />` Alpine island with the 4 inputs, 2 modifiers, 3 weapon cards, progress bar. Wire to character sheet skills (auto-fill current skill).

3. Build `<LootSplitTab />` Alpine island with textarea, parse function, settlement algorithm, hunt history list.

4. Build `<ImbuementsTab />` with 3 sections × N cards × 3 tier buttons each.

5. Wire the Reset button to clear ALL state and localStorage.

6. Final pass: Lighthouse audit, mobile testing, fix any issues.

7. Deploy to Cloudflare Pages.

8. Apply for Google AdSense.

9. Post launch on r/TibiaMMO + 2-3 Discord servers.

---

## Important reminders for Claude Code

- The performance budget is real: <100KB first-load JS+CSS combined. If you reach for a library, ask first.
- The violet active-state rule (in CLAUDE.md) is non-negotiable. Skulls, tier buttons, weapon cards, checkboxes — all use the same violet styling when selected.
- Build features incrementally. Don't try to one-shot the whole site.
- All UI copy in English (target audience is global Tibia community).
- Use `view` and `str_replace` tools rather than rewriting whole files.
- When in doubt about Tibia game mechanics or formulas, ask me — I'll check against TibiaPal source or TibiaWiki.
