# Setup Guide — From zero to first commit

Follow these steps in order. Estimated time: 30-45 minutes.

---

## 1. Buy the domain (5 minutes)

Suggested names (check availability):
- `tibiaplanner.com` ⭐ (recommended — matches positioning)
- `tibiaplanner.gg`
- `tibiabuddy.com`
- `tibiabuddy.gg`
- `tibiacalc.com`
- `tibiahub.gg`
- `mytibia.gg`

**Where to buy**: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (~$9.15/year for `.com`, no markup) or [Namecheap](https://namecheap.com).

**Why Cloudflare Registrar**: Same provider as Pages = simpler DNS setup later. Costs at-cost (no markup like GoDaddy/Namecheap).

---

## 2. Create GitHub repo (3 minutes)

1. Go to [github.com/new](https://github.com/new)
2. Name: same as your domain without TLD (e.g., `tibiaplanner`)
3. Public or private — your choice. Public is fine since this is an MIT-style fansite.
4. **Don't** initialize with README/license (we'll add files manually)
5. Click "Create repository"

Don't push yet — we'll do that after Step 4.

---

## 3. Bootstrap Astro project locally (5 minutes)

In a terminal:

```bash
# Pick a folder (your Documents or wherever you keep code)
cd ~/projects   # or wherever

# Create the Astro project
npm create astro@latest tibiaplanner

# Answers to prompts:
#   - Where? ./tibiaplanner
#   - How would you like to start? "Empty"
#   - TypeScript? "Yes"
#   - Strict? "Strict"
#   - Install dependencies? "Yes"
#   - Initialize git? "Yes"

cd tibiaplanner

# Verify it works
npm run dev
# Open http://localhost:4321 in browser. Should show empty Astro page.
# Press Ctrl+C to stop.
```

---

## 4. Add the project files (5 minutes)

Copy these three files into the root of your new project:
1. `CLAUDE.md` (the master context file)
2. `INITIAL_PROMPT.md` (the first prompt for Claude Code)
3. `README.md` (replace the default Astro one)

You'll find them attached to this conversation — download and drop them in.

---

## 5. First commit + push to GitHub (3 minutes)

```bash
git add .
git commit -m "Initial commit: Astro project scaffold + project context"

# Connect to your GitHub repo (replace YOUR_USERNAME and REPO_NAME):
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## 6. Connect to Cloudflare Pages (10 minutes)

1. Sign up / log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sidebar → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
3. Authorize Cloudflare to access your GitHub
4. Select your repo
5. Setup:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: none needed yet
6. Click "Save and Deploy"
7. Wait ~2 minutes — you'll get a URL like `tibiaplanner.pages.dev`

**It works!** Now every git push to `main` auto-deploys.

---

## 7. Connect your custom domain (5 minutes)

1. In Cloudflare Pages project → **Custom domains** → **Set up a custom domain**
2. Type your domain (e.g., `tibiaplanner.com`)
3. If domain is registered with Cloudflare Registrar: 1-click setup, automatic SSL
4. If registered elsewhere: Cloudflare will show you DNS records to add at your registrar (CNAME usually)
5. Wait 5-30 minutes for SSL provisioning

---

## 8. Open Claude Code in VS Code (2 minutes)

1. In VS Code, open the `tibiaplanner` folder
2. Open the Claude Code extension (sidebar icon)
3. Make sure it's signed in to your Claude Max account
4. Open the file `INITIAL_PROMPT.md` and read it
5. Copy the section "PROMPT TO PASTE" and paste it into Claude Code

Claude Code will read CLAUDE.md, set up the design system, and build the page shell. Review what it builds before approving the next step.

---

## 9. Iterate (the fun part)

After Step 4 of the initial prompt is approved, proceed feature by feature:
- Character Sheet
- Training Tab
- Loot Split Tab
- Imbuements Tab
- Reset button
- Polish + Lighthouse audit
- AdSense application

Each commit auto-deploys to Cloudflare. You can share the URL with friends for early feedback any time.

---

## 10. Apply for Google AdSense (after launch with content)

Once the site is live, has content, and has a privacy policy:
1. [adsense.google.com](https://adsense.google.com) → Sign up
2. Add your domain
3. Place the verification code in `src/layouts/Layout.astro`
4. Wait 1-7 days for review
5. Once approved, replace ad placeholder divs with AdSense code

---

## Common issues

**`npm create astro@latest` fails**: Make sure Node.js 18+ is installed. Run `node -v` to check.

**Cloudflare Pages build fails**: Check the build log. Most common: missing dependency. Run `npm install` locally and commit `package-lock.json`.

**Custom domain shows SSL warning**: Wait 30 minutes. Cloudflare provisions SSL automatically.

**Claude Code can't see CLAUDE.md**: Make sure the file is in the project root, not in a subfolder. Restart VS Code if needed.

---

## Files in this conversation

You should have downloaded these from this chat:
1. `CLAUDE.md` — Master context (5,000+ words, all decisions baked in)
2. `INITIAL_PROMPT.md` — First prompt for Claude Code (paste this verbatim)
3. `README.md` — Public README for the GitHub repo
4. `SETUP_GUIDE.md` — This file

All four go in the root of your new project.
