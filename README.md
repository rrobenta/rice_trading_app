# 🌾 Rice Trading Platform

A full-stack **mobile app** for buying and selling rice commodities. Traders, buyers, and suppliers can manage listings, place orders, track trades, and monitor live market pricing — from their phone.

---

## Stack

| Layer | Tech |
|---|---|
| Mobile | React Native + Expo (SDK 51), Expo Router v3 |
| Charts | react-native-gifted-charts |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcryptjs, stored in AsyncStorage |
| Decimals | decimal.js (no float math for prices) |

---

## Features

- **Dashboard** — market snapshot cards, recent orders & trades, quick-action buttons
- **Market** — per-variety price charts (7/14/30/90 day), live % change
- **Listings** — infinite-scroll browse with search + variety filter, create listing form
- **Orders** — BUY/SELL orders with fill progress bar, cancel action, trade history tab
- **Profile** — stats, editable account info, sign out
- **Auth** — login + register with role selection (Trader / Buyer / Supplier)
- **Matching engine** — orders auto-fill at price-time priority when placed

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [PostgreSQL](https://www.postgresql.org/) v14+
- iOS: Xcode (Mac only) or [Expo Go](https://expo.dev/client) app
- Android: Android Studio emulator or [Expo Go](https://expo.dev/client) app

---

## Setup

### 1. Install dependencies

```bash
npm install
cd client && npx expo install   # ensures correct peer deps
```

### 2. Configure the server

```bash
# Edit server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/rice_trading_db"
JWT_SECRET="your-random-secret"
PORT=3001
```

### 3. Run migrations + seed

```bash
npm run db:migrate
npm run db:seed
```

### 4. Configure the mobile API URL

```bash
# Edit client/.env
# Use your machine's local IP (not localhost) so the device can reach it
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api
```

> Find your IP: `ipconfig` on Windows → look for IPv4 Address

### 5. Start the server

```bash
npm run server
```

### 6. Start the mobile app

```bash
npm run mobile
# or for a specific platform:
npm run android
npm run ios
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## Demo Accounts (after seeding)

| Email | Role | Password |
|---|---|---|
| supplier@example.com | SUPPLIER | password123 |
| buyer@example.com | BUYER | password123 |
| trader@example.com | TRADER | password123 |

---

## Project Structure

```
rice_trading_app/
├── client/                        # Expo React Native app
│   ├── app/                       # Expo Router file-based routes
│   │   ├── _layout.tsx            # Root layout + auth guard
│   │   ├── (auth)/                # Login, Register screens
│   │   ├── (tabs)/                # Tab bar: Dashboard, Market, Listings, Orders, Profile
│   │   ├── listing/[id].tsx       # Listing detail
│   │   ├── listing/new.tsx        # Create listing form
│   │   ├── order/new.tsx          # Place order form
│   │   └── trade/[id].tsx         # Trade detail
│   ├── src/
│   │   ├── components/            # Card, Badge, Button, Input, LoadingScreen
│   │   ├── constants/theme.ts     # Colors, spacing, typography, shadows
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/api.ts             # Axios instance with JWT interceptors
│   │   └── types/index.ts
│   ├── assets/                    # App icons + splash (replace with real assets)
│   └── app.json                   # Expo config
│
├── server/                        # Express + TypeScript API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── api/                   # auth, listings, orders, trades, market, users
│       ├── db/                    # Prisma client + seed
│       ├── middleware/            # JWT auth, error handler
│       └── index.ts
│
└── package.json                   # npm workspaces root
```

---

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure your project
cd client
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

---

## API Summary

The mobile app consumes the same REST API as the web version — all endpoints documented in the server README. Set `EXPO_PUBLIC_API_URL` to your deployed server URL for production builds.
