# Zerofi — Your Money. Your Terms.
**Powered by Nova, your Zerofi AI Advisor**

A personal financial platform for gig workers, individuals, families, and businesses. No commissions. No jargon. No judgment.

---

## Quick Start

```bash
# 1. Unzip the project
unzip zerofi-app.zip && cd zerofi

# 2. Install dependencies
npm install

# 3. (Optional) Configure Supabase — see below
cp .env.example .env
# Edit .env with your Supabase keys

# 4. Run
npm run dev        # Development: http://localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

---

## Project Structure

```
zerofi/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          ← Copy to .env and fill in Supabase keys
├── supabase-setup.sql    ← Run in Supabase SQL Editor to set up DB
│
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx           ← Root: beta gate → auth → onboarding → dashboard
    ├── index.css         ← Global styles + font imports
    │
    ├── pages/
    │   ├── Dashboard.jsx ← Main dashboard (all tabs for all user types)
    │   ├── Wizard.jsx    ← Manual 9-step setup wizard (fallback)
    │   ├── Auth.jsx      ← Sign in / sign up / password reset / OAuth
    │   └── BetaGate.jsx  ← Invite code wall
    │
    ├── components/
    │   ├── NovaOnboarding.jsx  ← Nova conversational onboarding
    │   └── UI.jsx              ← Card, Label, BigVal, Bar, Toast, InlineEditor
    │
    ├── hooks/
    │   ├── useAuth.js    ← Supabase auth state + methods
    │   ├── useClock.js   ← Live clock (re-renders every second)
    │   ├── useStorage.js ← localStorage wrapper hook
    │   └── useTheme.js   ← Theme token accessor
    │
    └── utils/
        ├── constants.js  ← USER_TYPES, GOAL_OPTIONS, NOVA config, BUDGET_CATEGORIES
        ├── encrypt.js    ← AES-256-GCM client-side encryption (Web Crypto API)
        ├── format.js     ← fmt(), uid(), getWeekStart(), nextQuarterDate()
        ├── storage.js    ← localStorage + Supabase cloud save/load
        ├── supabase.js   ← Supabase client (dual-mode: cloud or local fallback)
        ├── betaCode.js   ← Beta invite code validation
        └── theme.js      ← Dark/light theme token objects
```

---

## Full User Flow

```
Open App
  └─▶ BetaGate          (enter invite code: ZEROFI2026)
        └─▶ Auth         (sign in / sign up — only if Supabase configured)
              └─▶ Nova   (conversational onboarding → builds config)
                    └─▶ Dashboard  (all tabs, full financial picture)
                          ├─▶ ⚙ Edit  → Wizard (manual setup)
                          └─▶ ↺ Reset → clears all data
```

**Without Supabase** (local mode): Beta gate → Nova → Dashboard. Data saved to localStorage only.

**With Supabase** (cloud mode): Beta gate → Auth → Nova → Dashboard. Data encrypted and synced to cloud.

---

## Setting Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-setup.sql`
3. Go to **Settings → API Keys** and copy your Project URL and Publishable key
4. Create `.env` from `.env.example`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   ```
5. `npm run dev` — auth is now active

---

## Beta Invite Codes

Current codes (edit `src/utils/betaCode.js` to change):
```
ZEROFI2026    NOVA2026    GETPAID2026
ZEROFIBETA    FAMILYBETA  GIGLIFE2026
```

---

## Security

| Layer | What it does |
|-------|-------------|
| Beta gate | Invite-only access during beta |
| Supabase Auth | Email/password + Google + Apple OAuth |
| AES-256-GCM | Data encrypted on device before upload |
| Row Level Security | Database enforces user data isolation |
| HTTPS | All traffic encrypted in transit (Vercel default) |

---

## Deployment

```bash
# Vercel (recommended)
npm i -g vercel && vercel

# Netlify
npm run build
# Drag dist/ folder to netlify.com/drop

# GitHub Pages
npm run build
# Push dist/ to gh-pages branch
```

---

## Adding Supabase Cloud Sync to Dashboard

Replace `save(key, value)` with `cloudSave(userId, key, value)` in Dashboard.jsx once auth is wired through. The storage layer in `utils/storage.js` already has `cloudSave` and `cloudLoad` ready to use.

---

Built by **getflowfi** — [github.com/getflowfi/Flowfi](https://github.com/getflowfi/Flowfi)
