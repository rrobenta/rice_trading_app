# Tech Stack

## Stack

- **Frontend**: React 18 + TypeScript (Vite, React Router v6, Recharts)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Monorepo**: `client/` and `server/` as npm workspaces

## Common Commands

```bash
# Install all dependencies
npm install

# Run both client and server in dev mode
npm run dev

# Individual workspaces
npm run dev --workspace=server     # Express API on :3001
npm run dev --workspace=client     # Vite React on :5173

# Database
npm run db:migrate --workspace=server    # Run Prisma migrations
npm run db:seed --workspace=server       # Seed demo data
npm run db:studio --workspace=server     # Open Prisma Studio

# Build
npm run build
```

## Notes

- All monetary/price values use `decimal.js` and Prisma `Decimal` type — never native floats
- Environment variables via `.env` in the root — copy `.env.example` and fill in values
- TypeScript strict mode enabled on both client and server
- Vite dev server proxies `/api` to `localhost:3001` — no CORS issues in dev
