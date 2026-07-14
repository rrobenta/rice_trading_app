# 🌾 RiceMarket — Rice Trading Inventory System

A Progressive Web App for managing rice trading inventory, expenses, and capital. Built with React + Firebase — free to host, works on any device, installable like a native app.

---

## Features

- **Login / Register** — Firebase Authentication (email + password)
- **Dashboard** — Available stocks, gross/net income, expenses, fast-moving items (live from Firestore)
- **Listings** — Add, edit, delete stock items (title, sell price, cost, quantity, batch date)
- **Expenses** — Track delivery, trucking, and misc costs
- **Capital** — Record investments and loans
- **PWA** — Installable on phone, works offline for cached pages
- **Real-time** — All data syncs live across devices

---

## Deploy (Step by Step)

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `rice-trading-app`) → Continue
3. Disable Google Analytics (optional) → Create Project

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** → **Get Started**
2. Click **Email/Password** → Enable → Save

### 3. Enable Firestore

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll add proper rules later)
3. Pick a region close to you → Done

### 4. Get your Firebase config

1. Go to **Project Settings** (gear icon) → **General** → scroll to **Your apps**
2. Click the **Web** icon (</>) → Register app (any nickname)
3. Copy the config object — you'll need `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

### 5. Set your config locally

Edit `client/.env`:

```
VITE_FIREBASE_API_KEY=AIzaSy...your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Also update `client/.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 6. Install Firebase CLI + deploy

```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Go to client folder
cd client

# Install dependencies
npm install

# Build and deploy
npm run deploy
```

Your app is now live at: `https://your-project-id.web.app`

### 7. Deploy Firestore rules + indexes

```bash
cd client
firebase deploy --only firestore
```

---

## Local Development

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
client/
├── src/
│   ├── components/AppShell.tsx    # Bottom nav + layout
│   ├── context/AuthContext.tsx    # Firebase auth state
│   ├── lib/firebase.ts           # Firebase init (Auth + Firestore)
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx     # Live stats from Firestore
│   │   ├── ListingsPage.tsx      # Listings + Expenses + Capital tabs
│   │   ├── CreateListingPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── ProfilePage.tsx
│   ├── styles/globals.css        # Mobile-first CSS
│   └── types/index.ts
├── firebase.json                 # Hosting + Firestore config
├── firestore.rules               # Security rules
├── firestore.indexes.json        # Composite indexes
└── package.json
```

---

## Firestore Collections

| Collection | Fields | Scoped by |
|---|---|---|
| `listings` | title, sellPrice, boughtFor, quantity, batchDate, uid, createdAt | user uid |
| `expenses` | description, amount, date, uid, createdAt | user uid |
| `capitals` | description, amount, date, uid, createdAt | user uid |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Auth | Firebase Authentication |
| Database | Cloud Firestore (real-time) |
| Hosting | Firebase Hosting (free) |
| PWA | vite-plugin-pwa + Workbox |
