# Tech Stack

## Frontend (client/) — Progressive Web App

- **Framework**: React 18 + TypeScript (Vite)
- **Routing**: React Router v6
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa (Workbox service worker, web manifest, offline caching)
- **HTTP**: Axios with JWT interceptor (localStorage)

## Backend (server/)

- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Decimals**: decimal.js — never use floats for prices

## Common Commands

```bash
# Run both client + server
npm run dev

# Individual
npm run client      # Vite dev server on :5173
npm run server      # Express API on :3001

# Database
npm run db:migrate  # Run Prisma migrations
npm run db:seed     # Seed demo data
npm run db:studio   # Open Prisma Studio

# Build PWA for production
npm run build       # outputs to client/dist/
```

## Notes

- Vite dev server proxies `/api` to localhost:3001 — no CORS issues locally
- PWA caches static assets + API responses for offline/low-connectivity use
- All monetary values use `decimal.js` on server, string formatting on client
- Set `VITE_API_URL` in `client/.env` for production builds pointing at your deployed API
- The app is installable on phones via "Add to Home Screen" in the browser
