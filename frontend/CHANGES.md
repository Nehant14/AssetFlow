# AssetFlow Frontend — Rebuilt to Match the Backend

## Fix pass — login bug + responsiveness (this change)

- **Critical bug fix:** `AuthContext.login()` read `response.data.user` /
  `response.data.token`, but every backend response is wrapped as
  `{ status, data: {...} }` (confirmed in `auth.service.js`'s `login()`,
  which returns `{ token, user }` inside `data`). Every other API call in
  this codebase already unwraps with `res.data?.data`; this one didn't, so
  `user` and `token` were always `undefined` and login silently failed
  (the string `"undefined"` was even being written to `localStorage` as the
  token). Fixed to destructure `response.data.data`.
- **Dead-endpoint calls removed:** `notifications.api.js` exported
  `getNotifications()` and `markNotificationRead()`, and the Notifications
  page called both, but `notification.routes.js` only mounts
  `GET /dashboard-kpis` — there's no personal-inbox list or mark-as-read
  route. Those calls (and the resulting 404s on every page load) were
  removed; the Inbox panel now explains that only the KPI summary is
  available from the API today, matching how Allocations/Maintenance/Audits
  already handle backend gaps.
- **Responsiveness:**
  - The Sidebar was a fixed `w-64` column always rendered alongside the
    content with no way to hide it, so on phone widths it ate over half the
    screen. It's now an off-canvas drawer below the `md` breakpoint,
    toggled by a hamburger button in the Navbar, with a backdrop and
    auto-close on navigation. Desktop/tablet keeps the original inline
    sidebar.
  - `.table-shell` used `overflow-hidden`, which clipped table columns
    instead of letting them scroll on narrow screens. Changed to
    `overflow-x-auto` with a `min-w-[640px]` on `.table-base` so tables
    scroll horizontally on mobile instead of losing data off the edge.
  - Navbar: title truncates/shortens, non-essential items (role badge,
    full name) hide below `sm`/`md`, and a hamburger button appears for the
    new mobile drawer.
  - Page containers use `p-4` instead of `p-6` below `sm`; a few forms that
    were `grid-cols-2` at every width (Asset registration, New allocation,
    audit cycle dates) now start at `grid-cols-1` and only go to 2+ columns
    from `sm`/`md` up, so fields aren't cramped on ~320–375px screens. Page
    header rows (`title + count`) now wrap instead of overflowing.

## Original rebuild

The frontend in this repo was originally built for a different problem
statement (a vehicle fleet management app: Vehicles, Drivers, Trips, Fuel
Expenses, License Reminders). The backend (`/backend`) implements a
different domain entirely: an **enterprise asset management system** —
Assets, Allocations, Transfers, Bookings, Maintenance, Audits, and
Departments/Categories/Employees (see `backend/prisma/schema.prisma`).

This pass replaces the frontend's pages, API layer, and RBAC model so they
match the backend's actual routes and data model, while keeping the same
design system, layout shell, and reusable hooks/components
(`components/common`, `hooks/useTableControls`, `utils/pdfExport`).

## What changed

- **API layer** (`src/api/`) — rewritten to call the real backend routes:
  `assets.api.js`, `allocations.api.js`, `bookings.api.js`,
  `maintenance.api.js`, `audits.api.js`, `organization.api.js`,
  `notifications.api.js`, plus a corrected `auth.api.js` (`/auth/signup`,
  not `/auth/register`). The old vehicle/driver/trip/fuel/report API files
  were removed.
- **RBAC** (`src/auth/roles.js`) — now uses the backend's real `Role` enum:
  `Admin`, `AssetManager`, `DepartmentHead`, `Employee`. Most GET endpoints
  in this backend are open to any authenticated user, so route-level
  gating was relaxed; individual create/update forms and buttons are gated
  per-page via `can(role, capability)`, matching where the backend actually
  applies `restrictTo([...])`.
- **Pages** (`src/pages/`) — Vehicles, Drivers, Trips, Fuel Expenses,
  Reminders, and Reports were removed. In their place: Assets, Allocations,
  Bookings, Maintenance, Audits, and Organization (Departments / Categories
  / Employees, tabbed). Dashboard and Notifications were rewritten around
  the real `GET /api/notifications/dashboard-kpis` payload.
- **Layout & branding** — Sidebar, Navbar, Login/Signup pages relabeled
  from "TransitOps" to "AssetFlow" with matching nav items.

## Known backend gaps this UI works around

A few backend routes don't have a matching list/detail endpoint, so those
pages derive what they can from data that *is* returned elsewhere, and are
labeled accordingly in-app:

- No `GET /api/allocations` — active allocations are derived from each
  asset's nested `allocations` array (`GET /api/assets`).
- No `GET /api/maintenance` — maintenance requests are derived the same way,
  from each asset's nested maintenance requests.
- No `GET /api/audits/cycles` (or any audit list) — the Audits page is
  action-only (create cycle / record verification / close cycle) with a
  session-local activity log, since there's nothing to fetch and display.
- No `GET /api/notifications` (personal inbox) — only the dashboard KPI
  aggregate exists, despite a `Notification` model in the schema.

Separately, several backend files reference fields/relations that don't
match `schema.prisma` (e.g. `asset.controller.js` sets `assetTag` where the
model field is `tag`; `maintenance.controller.js` currently exports audit
logic instead of `raiseRequest`/`updateStatus`; `rbac.middleware.js`
contains error-handler logic instead of a role-check function). Those are
backend bugs, not something this frontend change fixes — flagging them here
so they're not mistaken for a frontend integration issue if requests fail
against a real running server.
