# SKILL: Full-Stack Restaurant App Audit & Debug
**Stack: Next.js 15 App Router · React 19 · TypeScript · Firebase v10 · Firestore · Tailwind CSS v4 · shadcn/ui · Vercel Blob · Stripe · PWA**

---

## HOW TO USE THIS SKILL

Claude Code: When given this file, perform a **complete, systematic audit** of the entire codebase. Do NOT ask for permission between steps. Fix issues as you find them. Report what you changed and why. Work through every phase in order.

---

## PHASE 1 — CODEBASE MAPPING

Before touching anything, build a mental map:

```
1. Read package.json → confirm all dependency versions, flag outdated or conflicting packages
2. Read next.config.ts/js → check for misconfigurations, missing PWA settings, image domains
3. Read firebase.ts / firebase-config.ts → check initialization, env variable usage
4. Read lib/firebase-menu.ts → understand listener setup and teardown
5. Read hooks/use-menu-items.ts → understand state management for menu
6. Read lib/menu-data.ts → identify ALL static fallback data (this is the enemy)
7. Map all /app routes → admin routes, customer routes, API routes
8. Map all Firestore collections referenced in code
9. Map all onSnapshot listeners → check if they are ever unsubscribed
10. Check .env.local / .env.example → confirm all required Firebase env vars are documented
```

**Output:** List every file you've mapped with a one-line summary of its role.

---

## PHASE 2 — FIREBASE & FIRESTORE AUDIT

### 2A — Listener Integrity
- [ ] Find every `onSnapshot` call in the codebase
- [ ] Verify each one has a proper **unsubscribe** returned and called in `useEffect` cleanup
- [ ] Verify error callbacks are present: `onSnapshot(query, onNext, onError)` — missing `onError` causes silent failures
- [ ] Check if listeners are initialized inside components that can remount — this causes duplicate listeners
- [ ] Confirm listeners are NOT inside `useEffect` with dependencies that change frequently (causes listener thrashing)

**Fix pattern for safe listener:**
```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'menu_items'),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(items);
    },
    (error) => {
      console.error('[menu_items listener error]', error);
    }
  );
  return () => unsubscribe(); // CRITICAL: always cleanup
}, []); // empty deps = runs once only
```

### 2B — Static Fallback Contamination (HIGHEST PRIORITY BUG)
- [ ] Search entire codebase for `import.*menu-data` — every import is a potential source of stale data
- [ ] Find every location where Firebase data is MERGED with static data — DELETE the merge logic
- [ ] The rule: **Firebase is the single source of truth. Static data is ONLY used if Firebase is unreachable AND as a last resort.**
- [ ] Recommended pattern: show a loading skeleton while Firebase loads, never silently fall back to static

```typescript
// WRONG — merges and causes duplicates/stale data
const items = [...staticItems, ...firebaseItems];

// RIGHT — Firebase only, skeleton while loading
if (loading) return <MenuSkeleton />;
if (error) return <ErrorState message="Could not load menu" />;
return <MenuList items={firebaseItems} />;
```

### 2C — Firestore Security Rules
- [ ] Read current `firestore.rules`
- [ ] Verify admin writes are protected (only authenticated admin users can write)
- [ ] Verify customers can read menu items and categories
- [ ] Verify customers can only read/write their OWN orders (not other users' orders)
- [ ] Check for any `allow read, write: if true;` — this is a critical vulnerability, fix immediately

### 2D — Firestore Indexes
- [ ] Check `firestore.indexes.json` — all composite queries need indexes
- [ ] Any `orderBy` + `where` combination requires a composite index
- [ ] If index is missing, query silently fails or throws — add all needed indexes

### 2E — Firebase Admin SDK
- [ ] Verify Admin SDK is ONLY used in `/app/api/` routes — never in client components
- [ ] Check for accidental import of `firebase-admin` in client-side files
- [ ] Verify service account credentials are in env vars, never hardcoded

---

## PHASE 3 — NEXT.JS 15 APP ROUTER AUDIT

### 3A — Hydration Errors (SSR/CSR Mismatch)
Hydration errors crash the visible UI. Hunt them all down:

- [ ] Any component using `useEffect` to set state that affects initial render needs `suppressHydrationWarning` or must be wrapped in a client boundary
- [ ] Cart count, auth state, and any localStorage/sessionStorage reads MUST be client-only
- [ ] Pattern to fix hydration issues with auth/cart:

```typescript
// WRONG — causes hydration mismatch
export default function Header() {
  const { cartCount } = useCart(); // reads from localStorage on client only
  return <div>Cart ({cartCount})</div>;
}

// RIGHT — use mounted state
export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { cartCount } = useCart();
  useEffect(() => setMounted(true), []);
  return <div>Cart ({mounted ? cartCount : 0})</div>;
}
```

- [ ] Check every `"use client"` directive — any component using hooks, browser APIs, or event handlers needs it
- [ ] Check every component that does NOT have `"use client"` — it runs on the server and cannot use Firebase client SDK

### 3B — Route Structure Audit
- [ ] List all routes under `/app/` and verify each has proper loading.tsx, error.tsx
- [ ] Admin routes must be protected — check middleware.ts for auth guards
- [ ] Customer routes: verify unauthenticated users are redirected to login
- [ ] API routes (`/app/api/`): verify all return proper HTTP status codes, not just 200

### 3C — Server vs Client Component Separation
- [ ] Firebase client SDK (`firebase/firestore`, `firebase/auth`) → CLIENT components only
- [ ] Firebase Admin SDK → API routes only
- [ ] Data fetching in Server Components should use Admin SDK via API, not client SDK

### 3D — Next.js 15 Specific Checks
- [ ] `params` in page components are now async in Next.js 15 — check all `params.id` usage:
```typescript
// WRONG (Next.js 14 style)
export default function Page({ params }: { params: { id: string } }) {}

// RIGHT (Next.js 15)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```
- [ ] Check for deprecated `useRouter().query` — App Router uses `useParams()` and `useSearchParams()`

---

## PHASE 4 — REAL-TIME SYNC (ADMIN → CUSTOMER) AUDIT

This is the core feature. Test every scenario:

### 4A — Admin Panel Writes
- [ ] Find every admin "save" action — trace from UI button click → Firestore write
- [ ] Verify writes use `setDoc` with `{ merge: false }` for full updates (not partial merges that leave stale fields)
- [ ] Verify image uploads to Vercel Blob complete BEFORE the Firestore document is written (race condition risk)
- [ ] After admin saves, verify the response returns success before UI shows confirmation

### 4B — Customer Side Receives
- [ ] Confirm `onSnapshot` on customer side is active when admin writes
- [ ] Add explicit logging to confirm listener fires: `console.log('[menu update received]', snapshot.size, 'items')`
- [ ] Verify React state update from snapshot triggers a re-render (check for stale closures in callbacks)

### 4C — Category Deletion Edge Case
When a category is deleted:
- [ ] Items under that category should either be reassigned or hidden
- [ ] The tabs/navigation should update immediately
- [ ] Items should NOT render as orphaned (no category tab)
- [ ] Fix: when categories update, filter items to only show those with valid `categoryId`

### 4D — Optimistic Updates
- [ ] Admin UI should show changes immediately (optimistic) while write is in flight
- [ ] If write fails, roll back the optimistic update and show an error toast

---

## PHASE 5 — UI & NAVIGATION AUDIT

### 5A — Customer App
- [ ] Test every navigation path: Home → Category → Item Detail → Cart → Checkout
- [ ] Menu tabs: verify switching tabs doesn't reset scroll position unexpectedly
- [ ] Empty states: what shows when a category has no items? Add proper empty state UI
- [ ] Loading states: every data fetch needs a skeleton or spinner
- [ ] Error states: every data fetch needs an error UI with retry option
- [ ] Images: verify all menu item images load, have proper fallback if missing
- [ ] Cart: add/remove/quantity change — all must persist correctly
- [ ] Verify cart survives a page refresh (should be in localStorage)

### 5B — Admin Panel
- [ ] All CRUD operations: Create, Read, Update, Delete for menu items and categories
- [ ] Form validation: required fields, image upload size limits, price format
- [ ] Confirm dialogs before destructive actions (delete item, delete category)
- [ ] Success/error toasts after every save or delete
- [ ] Real-time preview: does admin see their own changes immediately?

### 5C — shadcn/ui Component Audit
- [ ] Check all shadcn components are properly installed in `components/ui/`
- [ ] Tailwind v4 uses CSS variables differently — verify `globals.css` has all required CSS custom properties for shadcn
- [ ] Check for any `cn()` utility usage — verify `lib/utils.ts` exports it correctly

---

## PHASE 6 — PWA & TESTFLIGHT READINESS

This app targets Apple TestFlight, meaning it likely wraps the PWA in a native shell (Capacitor or similar). Check:

### 6A — PWA Manifest
- [ ] `public/manifest.json` exists with: `name`, `short_name`, `start_url`, `display: standalone`, `icons` (at minimum 192x192 and 512x512 PNG)
- [ ] Icons must be proper PNG files, not SVG, for iOS compatibility
- [ ] `theme_color` and `background_color` set correctly

### 6B — Service Worker
- [ ] If using `next-pwa` or similar, verify it's configured in `next.config.js`
- [ ] Service worker must NOT cache Firestore API calls — only cache static assets
- [ ] Stale service worker can cause users to see old versions — verify update strategy

### 6C — iOS-Specific Requirements
- [ ] `<meta name="apple-mobile-web-app-capable" content="yes">` in `app/layout.tsx`
- [ ] `<meta name="apple-mobile-web-app-status-bar-style">` set appropriately
- [ ] Apple touch icons: `<link rel="apple-touch-icon" href="/icon-192.png">`
- [ ] Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`
- [ ] Test all touch interactions — tap targets minimum 44x44px
- [ ] Test safe area insets for iPhone notch/Dynamic Island: use `env(safe-area-inset-*)` in CSS

### 6D — If Using Capacitor
- [ ] `capacitor.config.ts` — verify `appId`, `appName`, `webDir: 'out'` (or `.next` if SSR)
- [ ] Run `npx cap sync` after any native config change
- [ ] Verify Firebase works over Capacitor's web view (check CORS and allowed domains)
- [ ] iOS `Info.plist` — verify camera/photo library permissions if image upload is used

---

## PHASE 7 — PERFORMANCE & STABILITY

### 7A — Bundle Size
- [ ] Run `next build` — check for large chunks (>500kb is a warning)
- [ ] Firebase imports: use modular SDK (`firebase/firestore` not `firebase/compat/firestore`)
- [ ] Check for duplicate dependencies in `node_modules`

### 7B — Memory Leaks
- [ ] Every `onSnapshot`, `setInterval`, `addEventListener` MUST have cleanup in `useEffect` return
- [ ] Async operations inside `useEffect` should check if component is still mounted before calling `setState`

```typescript
useEffect(() => {
  let isMounted = true;
  fetchData().then(data => {
    if (isMounted) setData(data);
  });
  return () => { isMounted = false; };
}, []);
```

### 7C — Rate Limiting & Quota
- [ ] Firestore charges per read — verify you're not re-fetching entire collections on every render
- [ ] Use `limit()` on queries where full collection is not needed
- [ ] Check if onSnapshot listeners restart on every hot reload in development (they shouldn't in production)

---

## PHASE 8 — SECURITY AUDIT

- [ ] No Firebase API keys, service account JSON, or secrets in any committed file
- [ ] `.gitignore` includes `.env.local` and any service account files
- [ ] Firestore rules prevent customers from reading other users' personal data
- [ ] Firestore rules prevent customers from writing to menu items or categories
- [ ] Admin routes require authentication — middleware blocks unauthenticated access
- [ ] API routes validate Firebase ID tokens server-side before processing admin actions
- [ ] Stripe webhook endpoint validates the Stripe signature header
- [ ] No `dangerouslySetInnerHTML` with user-provided content (XSS risk)

---

## PHASE 9 — FINAL VERIFICATION CHECKLIST

Run through this before declaring done:

**Admin Flow:**
- [ ] Login as admin → dashboard loads
- [ ] Add new menu category → appears immediately in customer app
- [ ] Add new menu item with image → appears in correct category in customer app
- [ ] Edit item price → updates in customer app within 3 seconds
- [ ] Delete item → disappears from customer app immediately
- [ ] Delete category → items reassigned or hidden, no broken tabs

**Customer Flow:**
- [ ] Sign up → email verification (if applicable) → login
- [ ] Browse menu → all categories show → all items show with images
- [ ] Add item to cart → cart count updates in header
- [ ] Change quantity in cart → total updates correctly
- [ ] Remove item from cart → cart updates
- [ ] Cart persists after page refresh
- [ ] Order placement flow (even if Stripe is disabled, UI should be clean)

**Cross-cutting:**
- [ ] No console errors in production build (`next build && next start`)
- [ ] No hydration warnings in browser console
- [ ] Page transitions are smooth, no flash of unstyled content
- [ ] App works on Safari iOS (most important for TestFlight)
- [ ] Tested on iPhone screen size (375px width minimum)

---

## EXECUTION INSTRUCTIONS FOR CLAUDE CODE

1. **Start with Phase 1** — map the codebase first, output the file list
2. **Fix Phase 2B first** (static fallback contamination) — this is likely causing most visible bugs
3. **Fix Phase 3A next** (hydration errors) — these cause crashes
4. **Work through remaining phases in order**
5. After each phase, run `next build` — fix any build errors before moving on
6. **Do not ask for confirmation between fixes** — fix and report
7. If you find something outside these phases, fix it and note it in your report
8. Final output: a summary of every change made, organized by phase

---

## QUICK REFERENCE: MOST LIKELY CULPRITS FOR THIS APP'S BUGS

| Symptom | Most Likely Cause | Fix |
|---|---|---|
| Admin update shows then disappears | Static fallback overwriting Firebase data | Remove merge logic, Firebase only |
| Category deleted but items still show | Items not filtered by valid categoryId | Filter items against active categories |
| Cart resets randomly | useEffect dependency causing cart reset | Audit cart hook deps |
| Hydration crash | Auth/cart state read before mount | Add `mounted` guard |
| Listener fires once then stops | Missing error handler, listener recreated | Add onError, empty deps array |
| Image upload then item disappears | Race condition: Firestore write before Blob upload completes | Await Blob, then write to Firestore |
| Admin changes not showing on customer device | Different Firestore instance or stale cache | Verify single Firebase init, check persistence settings |
