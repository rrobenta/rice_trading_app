# Tech Stack

## Mobile Client (client/)

- **Framework**: React Native via Expo SDK 51
- **Navigation**: Expo Router v3 (file-based, like Next.js)
- **Charts**: react-native-gifted-charts + react-native-svg
- **Storage**: AsyncStorage (JWT token)
- **HTTP**: Axios with JWT interceptor

## Backend (server/)

- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Decimals**: decimal.js — never use floats for prices

## Common Commands

```bash
# Server
npm run server             # Start Express API on :3001
npm run db:migrate         # Run Prisma migrations
npm run db:seed            # Seed demo data
npm run db:studio          # Open Prisma Studio

# Mobile
npm run mobile             # Start Expo dev server (scan QR with Expo Go)
npm run android            # Open on Android emulator
npm run ios                # Open on iOS simulator (Mac only)
```

## Notes

- Set `EXPO_PUBLIC_API_URL` in `client/.env` to your machine's local IP (not localhost) when testing on a real device
- All monetary values use `decimal.js` on server, string formatting on client — never `Number` for price math
- Expo Router uses file-based routing: `app/(tabs)/index.tsx` → `/` tab, `app/listing/[id].tsx` → `/listing/:id`
- Environment variables prefixed `EXPO_PUBLIC_` are available client-side in Expo
