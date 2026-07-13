# Project Structure

## Current Structure

```
rice_trading_app/
├── .kiro/steering/
├── client/                        # Expo React Native mobile app
│   ├── app/                       # Expo Router file-based routes
│   │   ├── _layout.tsx            # Root: AuthProvider + auth guard + Stack
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx        # Bottom tab bar config
│   │   │   ├── index.tsx          # Dashboard
│   │   │   ├── market.tsx         # Price charts
│   │   │   ├── listings.tsx       # Browse listings
│   │   │   ├── orders.tsx         # Orders + trades tabs
│   │   │   └── profile.tsx        # Profile + stats
│   │   ├── listing/
│   │   │   ├── [id].tsx           # Listing detail
│   │   │   └── new.tsx            # Create listing
│   │   ├── order/
│   │   │   └── new.tsx            # Place order
│   │   └── trade/
│   │       └── [id].tsx           # Trade detail
│   ├── src/
│   │   ├── components/            # Card, Badge, Button, Input, LoadingScreen
│   │   ├── constants/theme.ts     # Design tokens (colors, spacing, fonts, shadows)
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/api.ts
│   │   └── types/index.ts
│   ├── assets/                    # icon.png, splash.png (replace placeholders)
│   ├── app.json
│   └── package.json
│
├── server/                        # Express + TypeScript REST API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── api/
│       │   ├── auth/              # login, register, /me
│       │   ├── listings/          # CRUD + filters
│       │   ├── orders/            # Place + match + cancel
│       │   ├── trades/            # History + status
│       │   ├── market/            # Varieties + price history + summary
│       │   └── users/             # Profile
│       ├── db/prisma.ts
│       ├── db/seed.ts
│       ├── middleware/auth.ts
│       ├── middleware/error-handler.ts
│       ├── types/index.ts
│       ├── utils/pagination.ts
│       └── index.ts
│   └── package.json
│
├── package.json                   # npm workspaces root
├── .env.example
└── README.md
```

## Conventions

- **Expo Router** — route = file. Group folders `(auth)` and `(tabs)` don't add path segments
- **Screens** live in `app/` — shared logic/components live in `src/`
- **Design tokens** in `src/constants/theme.ts` — never hardcode colors or sizes inline
- **Thin screens** — data fetching in the screen component, UI logic in components
- **Naming**: files `kebab-case`, components `PascalCase`, functions `camelCase`
