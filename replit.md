# CJP Media

The official media wing of the Cockroach Janta Party — a political satire/roasts platform with Firebase backend.

## Run & Operate

- `pnpm --filter @workspace/cjp-media run dev` — run the Vite dev server (port from env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React + Tailwind CSS + shadcn/ui
- Routing: wouter
- Auth & DB: Firebase (client SDK) — Firestore + Google Auth
- Font: Geist Variable (`@fontsource-variable/geist`)
- Theme: `#050505` background, `#ccff00` primary accent

## Where things live

- `artifacts/cjp-media/src/` — all source code
- `artifacts/cjp-media/src/App.tsx` — wouter router (all 9 routes)
- `artifacts/cjp-media/src/pages/` — page-level components (HomePage, FeedPage, PostPage, CategoryPage, AdminPage, ProfilePage, DashboardPage, MessagesPage, NotificationsPage)
- `artifacts/cjp-media/src/app/` — feature components (AdminClient, PostViewClient, FeedClient, ProfileClient, etc.)
- `artifacts/cjp-media/src/components/` — shared UI components
- `artifacts/cjp-media/src/firebase.ts` — Firebase app init (client SDK); reads `src/firebase-applet-config.json`
- `artifacts/cjp-media/src/firebase-applet-config.json` — Firebase project config (projectId: cjp-media, custom firestoreDatabaseId)
- `artifacts/cjp-media/src/app/admin/actions.ts` — client-side Firebase actions (image upload via imgbb/cloudinary, profile/image settings)
- `artifacts/cjp-media/src/lib/firebaseAdmin.ts` — stubbed (was firebase-admin SSR, now no-op)

## Architecture decisions

- **No Next.js server code** — all `firebase-admin` / server actions converted to client-side Firebase SDK calls
- **wouter** for routing (replaces `next/link`, `useRouter`, `usePathname`)
- **`<img>`** everywhere (replaces `next/image`); `window.history.back()` replaces `router.back()`
- **Custom Firestore database** — `firestoreDatabaseId` in config is passed to `getFirestore(app, id)`
- `src/app/` page.tsx files removed (were Next.js server pages); Client components remain and are used by `src/pages/`

## Product

- Political satire platform with posts, categories, reactions, comments, bookmarks
- Admin panel for creating/editing/managing posts with image upload
- Google Auth sign-in
- Follow system, notifications, messages, user profiles

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firestore security rules must allow unauthenticated reads for public content (posts, categories) to load on the homepage without login
- Admin email: `tgff28970@gmail.com` — checked in `useAuth` to gate admin routes
- Image uploads go through imgbb or Cloudinary depending on admin settings stored in Firestore

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
