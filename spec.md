# Home Care Nurse

## Current State
Admin dashboard at `/admin-hidden-access` uses React Query (`useListAllNurses(refreshKey)`) to fetch nurses. The password constant `ADMIN_PASSWORD = "Yuva@9849"` is correct. The backend stable storage (`stable var stableNurses`) and `listAllNurses()` query function are correct. The registration form calls `actor.registerNurse()` which persists to both in-memory map and `stableNurses`.

## Requested Changes (Diff)

### Add
- Imperative direct actor call to fetch nurses on login and refresh (bypasses React Query timing issues)
- Loading spinner and "Connecting..." message while actor initializes
- Error state if `listAllNurses` throws
- A secondary useEffect that retries fetching every second for up to 10 seconds after login, stopping when nurses are found

### Modify
- `AdminDashboardPage`: Replace React Query `useListAllNurses(refreshKey)` with a local state array populated by direct `actor.listAllNurses()` imperative calls. Keep the 3-second polling as a fallback but also trigger a direct fetch on login, on refresh button click, and when actor first becomes ready.
- Refresh button: directly calls actor and updates local state immediately, not via query invalidation
- Password check: keep `ADMIN_PASSWORD = "Yuva@9849"` exactly as-is

### Remove
- Dependency on React Query `useListAllNurses` in the admin dashboard (replace with direct actor imperative call + local state)

## Implementation Plan
1. Rewrite `AdminDashboardPage` data-fetching: use `useState<Nurse[]>` for nurses list, `useState<boolean>` for loading, `useState<string|null>` for fetchError
2. Create a `fetchNurses()` async function that calls `actor.listAllNurses()` directly and sets state
3. Call `fetchNurses()` in useEffect when `actor && authed`, with a retry loop (up to 10 attempts, 1s apart) until nurses length > 0 or retries exhausted
4. Wire Refresh button to call `fetchNurses()` directly
5. Poll every 5 seconds with `setInterval` when logged in and actor ready
6. Keep edit/delete/service proof functionality using mutations (useUpdateNurse, useDeleteNurse, etc.) but trigger a fresh `fetchNurses()` after each mutation
7. Keep `ADMIN_PASSWORD = "Yuva@9849"` unchanged
