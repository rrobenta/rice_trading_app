# Project Structure

## Current Structure

```
rice_trading_app/
├── .kiro/steering/
├── client/                        # React PWA (Vite + vite-plugin-pwa)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons/                 # PWA icons (192, 512 png)
│   ├── src/
│   │   ├── components/AppShell.tsx  # Bottom nav + Outlet
│   │   ├── context/AuthContext.tsx
│   │   ├── lib/api.ts             # Axios + JWT interceptor
│   │   ├── pages/                 # Route-level page components
│   │   ├── styles/globals.css     # Mobile-first design system
│   │   └── types/index.ts
│   ├── index.html                 # PWA meta tags
│   ├── vite.config.ts             # PWA plugin config + proxy
│   └── package.json
│
├── server/                        # Express + TypeScript REST API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── api/                   # auth, listings, orders, trades, market, users
│       ├── db/                    # Prisma client + seed
│       ├── middleware/            # JWT auth, error handler
│       ├── types/
│       ├── utils/
│       └── index.ts
│   └── package.json
│
├── package.json                   # npm workspaces root
├── .env.example
└── README.md
```

## Conventions

- **Mobile-first CSS** — designed to feel like a native app on phones
- **Bottom nav** for primary navigation (5 tabs)
- **Pages** in `src/pages/` — one file per route
- **No component libraries** — lightweight utility CSS in globals.css
- **PWA** — installable via browser, offline-capable with Workbox
- **Naming**: files `kebab-case`, components `PascalCase`, functions `camelCase`
