# Verse by Verse

Verse by Verse is a Bible study and community app with a React web frontend, Expo mobile app, and shared request/normalization utilities. It supports Bible reading, notes, community groups, posts, polls, announcements, Bible Study posts, replies, and email-based auth flows.

## Project Structure

```txt
.
|-- src/                    # React web app
|-- apps/mobile/            # Expo React Native app
|-- packages/shared/        # Shared API clients, config, Bible/community/notes helpers
|-- public/                 # Static web assets
|-- package.json            # Root workspace + web scripts
`-- .env.example            # Example local env values
```

## Tech Stack

- React 19
- React Router
- Create React App
- Expo / React Native
- NativeWind / Tailwind for mobile styling
- npm workspaces
- Shared package: `@verse/shared`

## Main Features

- Bible reading with Scripture API support
- Chapter notes and note detail pages
- Auth, signup, password reset, and email verification flows
- Community browsing, creation, membership access, and settings
- Community posts with questions, polls, announcements, and Bible Study posts
- Nested replies / sub-replies
- Mobile app screens for reading, notes, profile, and community activity

## Requirements

- Node.js
- npm
- A running Verse by Verse backend API
- Scripture API key for Bible API requests

## Environment Variables

Create local env files from `.env.example`.

```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_SCRIPTURE_API_KEY=your_scripture_api_key
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:4000
EXPO_PUBLIC_SCRIPTURE_API_KEY=your_scripture_api_key
```

For web development, the app reads:

```env
REACT_APP_API_URL=http://localhost:4000
REACT_APP_SCRIPTURE_API_KEY=your_scripture_api_key
```

For production web builds, use:

```env
REACT_APP_API_BASE_URL=https://your-api-host
REACT_APP_SCRIPTURE_API_KEY=your_scripture_api_key
```

For mobile development, Expo reads:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:4000
EXPO_PUBLIC_SCRIPTURE_API_KEY=your_scripture_api_key
```

Do not commit real `.env` files or API keys.

## Install

```bash
npm install
```

This installs the root app, mobile workspace, and shared workspace dependencies.

## Run Web App

```bash
npm start
```

The web app runs at:

```txt
http://localhost:3000
```

The backend should be available at the API URL configured in your env file.

## Run Mobile App

```bash
npm run mobile:start
```

Other mobile scripts:

```bash
npm run mobile:android
npm run mobile:ios
npm run mobile:web
```

For physical-device testing, set `EXPO_PUBLIC_API_BASE_URL` to your computer's LAN IP and backend port, for example:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:4000
```

Your backend also needs to:

- listen on `0.0.0.0`
- allow requests from the Expo/mobile origin
- be reachable through your firewall

## Build Web App

```bash
npm run build
```

This outputs the production web build to `build/`.

## Tests

```bash
npm test
```

This runs the Create React App test runner.

## Shared Package

Shared code lives in `packages/shared` and is imported as `@verse/shared`.

Current shared responsibilities include:

- API base URL resolution
- API request client creation
- Auth API helpers
- Bible API helpers
- Community API helpers
- Notes API helpers
- Time formatting
- Community normalization

## Routing Notes

Important web routes include:

- `/` home
- `/about`
- `/study`
- `/bible/walkthrough`
- `/community`
- `/community-how`
- `/browse-community`
- `/create-community`
- `/community/:communityId`
- `/community/:communityId/my-posts`
- `/community/:communityId/posts/:postId`
- `/community/:communityId/bible-study/new`
- `/community/:communityId/members/manage`
- `/account`
- `/signup`
- `/check-email`
- `/verify-email`
- `/reset-password`

Protected routes redirect logged-out users to a walkthrough page when available, or to sign in otherwise.

## Security Notes

- Keep `.env`, `.env.*`, `node_modules`, `.expo`, build artifacts, and zip files out of git.
- Do not hardcode API keys in frontend source.
- Frontend environment variables are still visible in built client bundles, so sensitive secrets should live on the backend whenever possible.
- Rotate any key that has previously been committed.

## Useful Scripts

```bash
npm start              # Run web app
npm run build          # Build web app
npm test               # Run web tests
npm run mobile:start   # Start Expo
npm run mobile:android # Run Android app
npm run mobile:ios     # Run iOS app
npm run mobile:web     # Run mobile app in web mode
```
