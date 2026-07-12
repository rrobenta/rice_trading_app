# Project Structure

## Current Structure

```
rice_trading_app/
├── .kiro/
│   └── steering/              # AI assistant guidance files
├── client/                    # React 18 + TypeScript frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/        # Shared UI (Layout, nav)
│   │   ├── context/           # React context (AuthContext)
│   │   ├── lib/               # Axios API client
│   │   ├── pages/             # One file per route
│   │   ├── styles/            # globals.css (CSS custom properties)
│   │   └── types/             # Shared TypeScript types
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                    # Express + TypeScript backend
│   ├── prisma/
│   │   └── schema.prisma      # PostgreSQL schema (Prisma)
│   └── src/
│       ├── api/               # Feature folders: auth, listings, orders, trades, market, users
│       │   └── <feature>/
│       │       ├── <feature>.routes.ts
│       │       └── <feature>.controller.ts
│       ├── db/
│       │   ├── prisma.ts      # Singleton Prisma client
│       │   └── seed.ts        # Demo data seeder
│       ├── middleware/
│       │   ├── auth.ts        # JWT authenticate + requireRole
│       │   └── error-handler.ts
│       ├── types/             # AuthRequest, pagination types
│       ├── utils/             # getPaginationParams, buildPaginatedResponse
│       └── index.ts           # Express app entry point
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json               # npm workspaces root
└── README.md
```

## Conventions

- **Feature folders** in `server/src/api/` — each has its own routes + controller
- **Route handlers stay thin** — all logic lives in the controller
- **Pages are flat** in `client/src/pages/` — one file per route
- **CSS**: utility classes in `globals.css`, scoped styles via CSS Modules (`.module.css`)
- **No floating point** for money — use `decimal.js` on the server, format strings on the client

## Naming

- Files and folders: `kebab-case`
- React components: `PascalCase`
- Functions and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Prisma models: `PascalCase`
