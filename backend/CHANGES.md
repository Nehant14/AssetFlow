# Backend fix pass

All of these were found by cross-checking every controller/service against
`prisma/schema.prisma` (the source of truth) and, where relevant, against
what the frontend actually sends. Only the 12 files below were touched —
routing, auth, and everything else was already correct.

- **`assets/asset.routes.js`, `allocations/allocation.routes.js`,
  `maintenance/maintenance.routes.js`** — `restrictTo([...])` checked for
  the role string `'Asset_Manager'`, but the `Role` enum (and every JWT/user
  record) actually uses `'AssetManager'`. As written, an AssetManager could
  never pass these checks and would get 403'd registering assets, creating
  allocations, processing returns, or updating maintenance status. Fixed to
  `'AssetManager'`.

- **`assets/asset.controller.js`** — `getAssets` searched on `assetTag`,
  a field that doesn't exist on `Asset` (the schema field is `tag`); the
  query would throw. Fixed to `tag`.

- **`bookings/booking.service.js`** — `createBooking` destructured `userId`
  but wrote an undefined `bookedById` to `prisma.booking.create`
  (`ReferenceError`). Mapped `userId` → `bookedById`, the schema's actual
  field.

- **`allocations/allocation.service.js`** — `allocateAsset` destructured
  `employeeId` but the create call referenced an undefined `userId`
  (`ReferenceError`); the frontend also sends `userId` in the request body,
  not `employeeId`. The conflict-check query also filtered on `isActive`
  (not a field on `Allocation` — the schema uses `status`) and included a
  `user` relation that doesn't exist (`Allocation.employee` /
  `Allocation.department` are the real relation names). Fixed to accept
  `userId` from the request and map it to the schema's `employeeId` column,
  filter by `status: 'Active'`, and include the real relations.

- **`allocations/allocation.controller.js`** — `returnAsset` passed the
  route's `id` param (a string) straight into `where: { id }` against an
  `Int` primary key, and wrote `actualReturnDate`/`returnNotes`, neither of
  which exist on `Allocation` (the real fields are `returnedAt` and
  `returnCondition`). Fixed the type coercion and field names.

- **`maintenance/maintenance.service.js`** — `createMaintenanceRequest`
  wrote `requesterId`/`description` directly to Prisma, but
  `MaintenanceRequest` actually has `raisedById`/`issue`. `updateStatus`
  also compared against `'In_Progress'`/`'Under_Maintenance'`, but the
  `MaintenanceStatus`/`AssetStatus` enums use `InProgress`/`UnderMaintenance`
  (no underscore) — so approvals never actually flipped the asset into
  "under maintenance." Also added `Number(id)` for the route param. Fixed
  all four.

- **`notifications/notification.service.js`** — `getDashboardKPIs` called
  `prisma.maintenance.count(...)`; there is no `maintenance` model (it's
  `MaintenanceRequest`), so the dashboard KPI endpoint — used by both the
  Dashboard and Notifications pages — would 500 on every load. Fixed.

- **`organization/department.controller.js`** — promoting a department head
  set `role: 'Department_Head'`, but the `Role` enum value is
  `'DepartmentHead'`. Also added `Number()` coercion for `headId`/`parentId`
  coming from the request body, matching the `Int` schema type.

- **`organization/employee.controller.js`** — `updateEmployeeRole` passed
  the string route param straight into `where: { id }` against an `Int`
  primary key. Added `Number(id)`.

- **`audits/audit.service.js`** — the most out-of-sync file:
  - `createAuditCycle` wrote a `name` field that doesn't exist on
    `AuditCycle` (only `departmentId`/`location`/`startDate`/`endDate` do —
    there's currently nowhere in the schema to persist the "Cycle Name"
    the frontend form collects) and tried `auditors: { connect: [...] } }`
    as if it were a direct many-to-many to `User`. It's actually a
    one-to-many to the `AuditAssignment` join model, so `connect` doesn't
    apply — rewritten to create `AuditAssignment` rows explicitly.
  - `recordVerification` wrote to `prisma.auditRecord`, a model that
    doesn't exist (`AuditItem` is the real model), and used a `status`
    field where the schema calls it `result`. Fixed.
  - `closeCycle` set an `isClosed` boolean that doesn't exist (`AuditCycle`
    tracks state via `status: AuditStatus`, i.e. `'Open'`/`'Closed'`) and
    included/iterated `records` instead of the real relation, `items`.
    Also added `Number(id)`. Fixed.

## Known gap (not a bug, a schema limitation)

`AuditCycle` has no field to store a name/label — only `location` is a free
-text description field. The frontend's "Cycle Name" input is accepted but
currently has nothing to be written to. If you want cycles to be nameable,
that needs a migration adding a column (e.g. `name String?`) to
`AuditCycle` in `schema.prisma`, which wasn't done here since it's a schema
change rather than a bug fix.

## Verified

- `npx prisma validate` — schema is valid.
- `node --check` on all 12 edited files — no syntax errors.
- Booted `src/server.js` and hit `/api/health`, `/api/auth/signup`, and
  `/api/auth/login` locally; the app boots and Prisma reaches the query
  layer correctly. A live query timed out in this sandbox specifically
  (`ETIMEDOUT` reaching Postgres) because outbound network access is
  disabled in this environment — that's an environment limitation, not a
  code issue; run it in your own environment with DB access to confirm the
  full request/response cycle.
