# AssetFlow — Organization Asset Management API

AssetFlow is a backend API for tracking and managing an organization's physical assets end-to-end: who has what, who's allowed to book it, when it needs maintenance, and whether it's actually where it's supposed to be.

Built for teams that hand out laptops, tools, vehicles, or shared equipment and need a single source of truth instead of a spreadsheet.

## ✨ Core Features

- **Asset Registry** — register assets with auto-generated tags (`AF-0001`, `AF-0002`...), track condition, location, and status (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed)
- **Allocations** — assign assets to employees or departments, with a built-in guard that blocks double-allocating an asset that's already checked out
- **Bookings** — reserve shared/bookable resources (e.g. a meeting room projector) for a time window, with overlap detection so two people can't double-book the same slot
- **Maintenance Requests** — employees raise issues on an asset; status flows from Pending → Approved/Rejected → In Progress → Resolved, automatically flipping the asset's status along the way
- **Audit Cycles** — periodic physical audits per department/location, with per-asset verification (Verified / Missing / Damaged) that auto-updates asset status on discrepancies
- **Org Structure** — departments (with hierarchy), categories, and employees with role-based access
- **Role-Based Access Control** — Admin, Asset Manager, Department Head, and Employee roles, enforced via middleware on sensitive routes
- **Dashboard KPIs** — quick counts (available/allocated assets, active bookings, pending maintenance) for a home-screen overview

## 🛠️ Tech Stack

- **Node.js + Express 5** — REST API
- **PostgreSQL + Prisma ORM** — data layer, with migrations
- **JWT + bcrypt** — auth and password hashing

## 📐 Architecture

Modular, feature-based structure — each domain owns its routes, controller, and service:

```
src/
├── modules/
│   ├── auth/            # signup, login, JWT issuance
│   ├── assets/           # asset registry & lookup
│   ├── allocations/      # check-out / check-in to employees or departments
│   ├── bookings/         # time-slot reservations for shared assets
│   ├── maintenance/      # issue reporting & resolution workflow
│   ├── audits/           # audit cycles & verification
│   ├── organization/     # departments, categories, employees
│   └── notifications/    # dashboard KPIs
├── middlewares/          # auth guard, role guard, error handler
└── config/               # Prisma client setup
```

## 🔑 API Overview

| Module | Endpoint | Description |
|---|---|---|
| Auth | `POST /api/auth/signup` | Register a new user |
| Auth | `POST /api/auth/login` | Log in, get a JWT |
| Assets | `POST /api/assets` | Register a new asset *(Admin/Asset Manager)* |
| Assets | `GET /api/assets` | Search/filter assets |
| Allocations | `POST /api/allocations` | Allocate an asset to a user/department |
| Allocations | `POST /api/allocations/:id/return` | Return an allocated asset |
| Bookings | `POST /api/bookings` | Book a shared asset for a time window |
| Bookings | `GET /api/bookings` | List bookings |
| Maintenance | `POST /api/maintenance` | Raise a maintenance request |
| Maintenance | `PATCH /api/maintenance/:id/status` | Update request status *(Admin/Asset Manager)* |
| Audits | `POST /api/audits/cycles` | Start an audit cycle *(Admin)* |
| Audits | `POST /api/audits/verify` | Record a verification result |
| Audits | `PATCH /api/audits/cycles/:id/close` | Close & reconcile an audit cycle *(Admin)* |
| Organization | `POST /api/org/departments`, `/categories` | Manage master data *(Admin)* |
| Organization | `GET /api/org/employees` | List employees |
| Organization | `PATCH /api/org/employees/:id/role` | Change a user's role *(Admin)* |
| Notifications | `GET /api/notifications/dashboard-kpis` | Dashboard summary counts |

All routes except `/auth` and `/health` require a `Bearer` JWT token.

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT

# 3. Run migrations
npx prisma migrate dev

# 4. Start the server
npm run dev
```

Health check: `GET /api/health`

## 👥 Roles

| Role | Can do |
|---|---|
| Admin | Everything — org setup, role management, audits |
| Asset Manager | Register/allocate assets, manage maintenance |
| Department Head | Departmental oversight |
| Employee | Book resources, raise maintenance requests |

## 🗺️ Roadmap Ideas

- Asset transfer requests between departments (schema already supports it via `Transfer` model)
- Notification delivery (email/push) beyond the current KPI endpoint
- File uploads for asset photos and maintenance evidence
- QR-code check-in/check-out flow using the existing `qrCode` field

---
Built for Odoo Hackathon · 2026
