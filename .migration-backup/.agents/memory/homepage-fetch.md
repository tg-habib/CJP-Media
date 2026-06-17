---
name: HomePage settings-vs-posts fetch
description: Why settings and posts fetches must be in separate try/catches
---
`HomePage.tsx` fetches `settings/profile` (for hero background images) AND the `posts` collection.

The `settings/profile` document requires admin/authenticated reads due to Firestore rules.
If both fetches share one try/catch, a settings permission error silently blocks all posts from rendering.

**Why:** Firebase throws immediately on permission error — one failed `getDoc` aborts the entire try block.
**How to apply:** Always use separate try/catch blocks for settings and posts in HomePage.
