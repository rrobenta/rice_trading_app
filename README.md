# 🌾 Rice Trading Platform

A full-stack web application for buying and selling rice commodities. Traders, buyers, and suppliers can manage listings, place orders, track trades, and monitor market pricing trends.

---

## Features

- **Market Overview** — Live price chart with 30-day history per rice variety
- **Listings** — Browse and create rice sale listings with grade, moisture, location filters
- **Orders** — Place BUY/SELL orders with automatic price-time priority matching engine
- **Trades** — Full trade history with buyer/seller roles and status management
- **Auth** — JWT-based registration and login (Trader / Buyer / Supplier roles)
- **Profile** — Account stats and editable contact info

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript, Vite, React Router v6, Recharts |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcryptjs |
| Decimals | decimal.js (all price/quantity values) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) v14 or later

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your database connection string:

```
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/rice_trading_db"
JWT_SECRET="change-this-to-a-long-random-string"
```

### 3. Create the database

```bash
# In PostgreSQL
createdb rice_trading_db
```

### 4. Run migrations

```bash
npm run db:migrate --workspace=server
```

### 5. Seed demo data

```bash
npm run db:seed --workspace=server
```

This creates 5 rice varieties, 3 demo accounts, sample listings, and 30 days of price history.

**Demo accounts (password: `password123`)**
| Email | Role |
|---|---|
| supplier@example.com | SUPPLIER |
| buyer@example.com | BUYER |
| trader@example.com | TRADER |

### 6. Start the app

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Prisma Studio: `npm run db:studio --workspace=server`

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/listings` | — | List all active listings |
| POST | `/api/listings` | ✓ | Create listing |
| GET | `/api/listings/:id` | — | Listing detail |
| PUT | `/api/listings/:id` | ✓ | Update listing |
| DELETE | `/api/listings/:id` | ✓ | Deactivate listing |
| GET | `/api/orders` | ✓ | My orders |
| POST | `/api/orders` | ✓ | Place order (triggers matching) |
| PATCH | `/api/orders/:id/cancel` | ✓ | Cancel order |
| GET | `/api/trades` | ✓ | My trades |
| PATCH | `/api/trades/:id/status` | ✓ | Mark complete/disputed |
| GET | `/api/market/varieties` | — | All rice varieties |
| GET | `/api/market/prices` | — | Price history |
| GET | `/api/market/summary` | — | Market snapshot with % change |
| GET | `/api/users/profile` | ✓ | Profile + stats |
| PUT | `/api/users/profile` | ✓ | Update profile |

---

## Project Structure

```
rice_trading_app/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/        # Layout, shared UI
│       ├── context/           # AuthContext
│       ├── lib/               # Axios instance
│       ├── pages/             # Route-level page components
│       ├── styles/            # Global CSS
│       └── types/             # Shared TypeScript types
│
├── server/                    # Express backend
│   ├── prisma/
│   │   └── schema.prisma      # DB schema
│   └── src/
│       ├── api/               # Routes + controllers per feature
│       ├── db/                # Prisma client + seed
│       ├── middleware/        # Auth, error handler
│       ├── types/             # AuthRequest, pagination types
│       └── utils/             # Pagination helpers
│
├── .env.example
└── package.json               # npm workspaces root
```

---

## Order Matching

When a new order is placed, the server runs a price-time priority matching engine:

- **BUY** order matches against open **SELL** orders at or below the buy price
- **SELL** order matches against open **BUY** orders at or above the sell price
- Orders fill partially if quantity allows, updating status to `PARTIALLY_FILLED`
- Each match creates a `Trade` record and a `PriceHistory` entry
- All matching logic runs inside a Prisma transaction for consistency
