# TransitOps Frontend — Fixes & Additions

## Critical build-breaking issues (app would not run at all before)
- **Missing `vite.config.js`** — added, with the React plugin and a dev proxy to `/api`.
- **Missing `tailwind.config.js` and `postcss.config.js`** — added. Every Tailwind class in the
  codebase (`bg-white`, `shadow`, `rounded`, etc.) was doing nothing without these.
- **Missing `src/index.css`** — `main.jsx` imported it but the file never existed.
- **Missing `useAuth` hook** — `App.jsx` imported `{ useAuth }` from `context/AuthContext.jsx`,
  but that file only exported `AuthContext`/`AuthProvider`. This crashed the app on load.
  Added the hook.
- **`AppRoutes.jsx` imported pages that no longer matched the folder names** (`AssetDirectory`,
  `ResourceBooking`) — fixed to import the correct, renamed pages.
- **`.env.example`** added for `VITE_API_URL`.

## Dead / disconnected code (features existed but were unreachable)
The previous version had fully-written pages for **Driver Management** and **Fuel & Expense
Management** sitting in oddly-named, unrouted folders (`OrganizationSetup`, `Audit`), so they
were invisible in the running app. Renamed and wired up:
- `pages/OrganizationSetup` → `pages/Drivers` → routed at `/drivers`
- `pages/Audit` → `pages/FuelExpenses` → routed at `/fuel-expenses`
- `pages/AssetDirectory` → `pages/Vehicles` → routed at `/vehicles`
- `pages/ResourceBooking` → `pages/Trips` → routed at `/trips`
- `api/assets.api.js` → `api/vehicles.api.js`
- `api/bookings.api.js` → `api/trips.api.js`

`Sidebar.jsx` linked to `/organization` and `/audits`, which were never valid routes — fixed to
point at the real paths above.

## Removed (out of spec, unused)
- `pages/AllocationTransfer` and `api/allocations.api.js` — not part of the TransitOps spec and
  not referenced by any route.
- `api/audits.api.js` — unused dead file (unrelated to the actual fuel/expense feature).
- The empty, unused duplicate `src/auth/AuthContext.jsx`.

## Missing spec requirements added
- **Reports & Analytics page** (`pages/Reports`, spec §3.8) — Fuel Efficiency, Fleet Utilization,
  Operational Cost, Vehicle ROI, and **CSV export**. This section of the spec had no frontend
  code at all before.
- **Dashboard** was only showing 4 of the 7 required KPIs and had no filters — added the
  remaining KPIs (Pending Trips, Drivers On Duty, Active Vehicles) and filters by vehicle type,
  status, and region (spec §3.2).
- **Trip Management** only had a create/dispatch form with no way to view existing trips or
  Complete/Cancel them (spec §3.5 lifecycle: Draft → Dispatched → Completed/Cancelled) — added a
  full trip list with a Complete modal (captures final odometer + fuel consumed) and Cancel action.
- **Maintenance** only had a create form with no list or way to close a maintenance record —
  vehicles would have stayed "In Shop" forever. Added a log list with a Close action.
- **Vehicle Registry** form used uncontrolled inputs that never cleared after submit, and had no
  way to ever set a vehicle to "Retired" even though that's one of the four required status
  values — fixed both, and added error display for duplicate registration numbers.
- **Driver Management** had no way to change a driver's status (e.g. to Suspended) and did not
  visually flag expired licenses (a core business rule: expired-license drivers can't be
  dispatched) — added both.
- Added dedicated `api/drivers.api.js`, `api/fuel.api.js`, and `api/reports.api.js` modules
  (previously several pages called `axiosClient` directly with no reusable API layer).
- **Login/Signup** had no error handling shown to the user, and no navigation link between the
  two pages — fixed both, and login now redirects to the dashboard on success.
- **`App.jsx`** checked `localStorage.getItem('token')` directly instead of reading actual auth
  state, so the sidebar/navbar wouldn't reliably appear/disappear on login/logout without a full
  page refresh — now uses `useAuth()`.

## Getting started
```bash
cd frontend
npm install
cp .env.example .env   # point at your backend
npm run dev
```
