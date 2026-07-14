# 🌾 RiceMarket — Progressive Web App

A full-stack **PWA** for buying and selling rice commodities. Installs on any phone like a native app — no app store needed. Works offline, sends push notifications, and feels native with a bottom tab bar and mobile-first UI.

---

## Features

- **Installable** — "Add to Home Screen" on any phone/tablet/desktop
- **Offline-capable** — Workbox service worker caches app shell + API data
- **Dashboard** — market snapshot, recent activity, quick actions
- **Market** — per-variety price charts with time range selector
- **Listings** — browse, search, filter, create rice sale listings
- **Orders** — BUY/SELL with auto-matching engine, fill progress
- **Trades** — history, complete/dispute workflow
- **Profile** — stats, editable account info

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript, Vite, React Router v6, Recharts |
| PWA | vite-plugin-pwa, Workbox (precache + runtime cache) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcryptjs (stored in localStorage) |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/rice-trading-app.git
cd rice-trading-app

# 2. Install
npm install

# 3. Configure DB
# Edit server/.env → set DATABASE_URL and JWT_SECRET

# 4. Migrate + seed
npm run db:migrate
npm run db:seed

# 5. Start both servers
npm run dev
# → PWA: http://localhost:5173
# → API: http://localhost:3001
```

### Demo accounts (password: `password123`)
- supplier@example.com (SUPPLIER)
- buyer@example.com (BUYER)
- trader@example.com (TRADER)

---

## Deploy to Production (Free)

### Option A: Vercel (frontend) + Railway (backend)

**1. Deploy backend to Railway:**
- Go to [railway.app](https://railway.app) → Deploy from GitHub
- Root directory: `server`
- Add PostgreSQL plugin
- Add env vars: `JWT_SECRET`, `JWT_EXPIRES_IN=7d`
- Build: `npm install && npm run build`
- Start: `npm start`
- Run `npx prisma migrate deploy && npm run db:seed` in Railway shell

**2. Deploy frontend to Vercel:**
- Go to [vercel.com](https://vercel.com) → Import GitHub repo
- Root directory: `client`
- Build command: `npm run build`
- Output: `dist`
- Env var: `VITE_API_URL=https://your-railway-url.up.railway.app/api`

### Option B: Railway for everything
- Deploy the whole repo, with two services (one for `server/`, one for `client/` as static site)

### Option C: GitHub Pages (frontend only, needs external API)
```bash
cd client
npm run build
# Upload dist/ to GitHub Pages
```

---

## How to Install the PWA on Your Phone

1. Open the deployed URL in your phone's browser (Chrome/Safari)
2. You'll see an "Install" or "Add to Home Screen" prompt
3. Tap it — the app appears on your home screen with its own icon
4. It now runs fullscreen like a native app, works offline

---

## Project Structure

```
rice_trading_app/
├── client/          # React PWA (Vite + vite-plugin-pwa)
│   ├── public/      # favicon, PWA icons
│   ├── src/
│   │   ├── components/  # AppShell (bottom nav)
│   │   ├── context/     # AuthContext
│   │   ├── lib/         # Axios client
│   │   ├── pages/       # All screens
│   │   ├── styles/      # Mobile-first CSS
│   │   └── types/       # TypeScript types
│   └── vite.config.ts   # PWA manifest + caching config
│
├── server/          # Express + TypeScript API
│   ├── prisma/      # Schema + migrations
│   └── src/api/     # auth, listings, orders, trades, market, users
│
└── package.json     # npm workspaces root
```
