# Mobile App Setup

This repo now includes a starter React Native app in `apps/mobile`.

## Current structure

- `src/`: existing web app
- `apps/mobile/`: Expo-based React Native app with NativeWind/Tailwind, Playfair typography, and a bottom-tab shell
- `packages/shared/`: starter shared package for logic that can be reused across web and mobile

## Install

From the repo root:

```bash
npm install
```

## Run mobile

From the repo root:

```bash
npm run mobile:start
```

Set a mobile API host before testing auth:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_SERVER_HOST:4000
```

Set a Scripture API key before testing live Bible reads:

```bash
EXPO_PUBLIC_SCRIPTURE_API_KEY=your_scripture_api_key
```

For a physical phone, use your computer's LAN IP or hosted API URL instead of `localhost`.

## Current mobile direction

- Tailwind styling is handled with NativeWind
- Playfair Display is loaded as the primary Verse by Verse font family
- The app shell currently follows a reading-first mobile pattern with `Read`, `Notes`, and `Profile` tabs
- Shared auth and notes logic still come from `packages/shared`
- Shared Bible passage reads now come from `packages/shared` as well

Optional:

```bash
npm run mobile:android
npm run mobile:ios
npm run mobile:web
```

## Recommended next extraction steps

1. Move API configuration helpers into `packages/shared`
2. Move notes/community normalization and request helpers into `packages/shared`
3. Keep mobile UI separate from web UI
4. Rebuild screens in React Native while reusing shared logic

## Important note

The current web app still lives at the repo root. This keeps the change low-risk while we start the mobile app. If you want a full `apps/web` monorepo migration later, we can do that as a second phase.

Expo / React Native tooling in this workspace expects Node 18+.
