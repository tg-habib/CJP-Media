---
name: Firebase bookmark path
description: Where bookmarks are stored and how to read/write them
---
Bookmarks are stored at `users/{uid}/bookmarks/{postId}` in the custom Firestore database.
Each document: `{ postId, title, imageUrl, category, savedAt: serverTimestamp() }`.

`toggleBookmark(uid, post)` is exported from `firebase.ts` — it checks existence and setDoc/deleteDoc accordingly.
`getBookmarkStatus(uid, postId)` returns a boolean (one-shot read).

In `PostViewClient.tsx`, subscribe to the bookmark doc via `onSnapshot` to get real-time saved state.
In `DashboardPage.tsx`, subscribe to the entire `users/{uid}/bookmarks` collection with `orderBy('savedAt', 'desc')`.

**Why:** Flat subcollection per user scales well, allows real-time sync, and avoids cross-reads.
**How to apply:** Always use `toggleBookmark` from firebase.ts — never write directly from components.
