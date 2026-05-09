# Ruff Liners — Euka Dashboard

Live TikTok Shop affiliate performance dashboard. Fetches fresh data from Euka on every page load via the Anthropic API + Euka MCP.

---

## Deploy to Vercel (Step-by-Step)

### Step 1 — Install prerequisites

You need **Node.js** and **Git** on your machine.

- Node.js: https://nodejs.org (download the LTS version)
- Git: https://git-scm.com/downloads

Verify they're installed:
```bash
node -v   # should print v18 or higher
git -v    # should print a version number
```

---

### Step 2 — Create a GitHub account (if you don't have one)

Go to https://github.com and sign up for a free account.

---

### Step 3 — Create a new GitHub repository

1. Go to https://github.com/new
2. Name it `ruff-liners-dashboard`
3. Set it to **Private**
4. Do NOT initialize with a README (we already have one)
5. Click **Create repository**
6. GitHub will show you a page with setup instructions — keep this tab open

---

### Step 4 — Push this code to GitHub

Open your terminal, navigate to this project folder, then run:

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial dashboard"

# Connect to your GitHub repo (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ruff-liners-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### Step 5 — Create a Vercel account

Go to https://vercel.com and sign up — use "Continue with GitHub" to link your accounts.

---

### Step 6 — Import the project to Vercel

1. From your Vercel dashboard, click **Add New → Project**
2. Find `ruff-liners-dashboard` in the list and click **Import**
3. Under **Framework Preset**, Vercel should auto-detect **Next.js** — leave it as is
4. **Do NOT click Deploy yet** — you need to add environment variables first

---

### Step 7 — Add environment variables in Vercel

Still on the import screen, scroll down to **Environment Variables** and add these three:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (from https://console.anthropic.com) |
| `EUKA_MCP_URL` | `https://app.euka.ai/api/mcp` |
| `EUKA_STORE_ID` | `455ea4f9-a404-411b-b748-9ba1929efb93` |

> ⚠️ Your API key is a secret. Vercel stores it encrypted and never exposes it to the browser.

---

### Step 8 — Deploy

Click **Deploy**. Vercel will:
- Install dependencies
- Build the Next.js app
- Deploy it to a URL like `https://ruff-liners-dashboard.vercel.app`

This takes about 60–90 seconds.

---

### Step 9 — Open your live dashboard

Click **Visit** when the build finishes. The dashboard will load and fetch live data from Euka automatically.

---

## How it updates

The dashboard fetches fresh data every time the page is loaded. There is also a **↻ Refresh** button in the top-right corner to pull new data without reloading.

Vercel also caches the API response for 1 hour automatically, so repeated visits within the same hour load instantly.

---

## Deploying updates

Whenever you want to update the dashboard code, just push to GitHub:

```bash
git add .
git commit -m "Update dashboard"
git push
```

Vercel automatically redeploys within ~60 seconds of every push.

---

## Run locally

```bash
# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Then edit .env.local and fill in your ANTHROPIC_API_KEY

# Start the dev server
npm run dev
```

Open http://localhost:3000

---

## Project structure

```
src/
  app/
    api/
      dashboard/
        route.js        ← Server-side API route (secrets live here)
    components/
      Dashboard.js      ← Client-side React dashboard UI
    layout.js           ← Root HTML layout
    page.js             ← Entry point
```
