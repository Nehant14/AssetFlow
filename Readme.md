<div align="center">

# 🗂️ AssetFlow

### Enterprise Asset Management System

A full-stack platform for tracking the entire lifecycle of an organization's assets — from allocation and booking to maintenance and audits — behind a secure, role-based access layer.

![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens)

</div>

---

## 📖 Overview

AssetFlow is a comprehensive full-stack application designed to streamline the management of organizational assets. It provides tools for tracking the asset lifecycle, handling bookings and allocations, managing maintenance schedules, and conducting audits — all wrapped in a secure, role-based access control (RBAC) system.

## 🚀 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
- ⚛️ **Framework:** React.js powered by Vite
- 🎨 **Styling:** Tailwind CSS
- 🧭 **Routing:** React Router
- 🌐 **State Management:** React Context (`AuthContext`, `ThemeContext`)
- 📡 **API Client:** Axios with custom interceptors

</td>
<td valign="top" width="50%">

**Backend**
- 🟩 **Environment:** Node.js
- 🚏 **API Framework:** Express.js (v5)
- 🗄️ **Database ORM:** Prisma → PostgreSQL
- 🔐 **Authentication:** JWT + RBAC middleware

</td>
</tr>
</table>

## 🏗️ Project Structure

A monorepo containing two distinct directories:

```text
AssetFlow/
├── backend/                # Node.js backend API
│   ├── prisma/              # Database schema & migrations
│   ├── src/
│   │   ├── config/           # Database and server configuration
│   │   ├── middlewares/      # Auth, RBAC, and error handling
│   │   ├── modules/          # Domain-specific logic
│   │   │   ├── auth/           # Signup, login, JWT issuance
│   │   │   ├── assets/         # Asset registry & lookup
│   │   │   ├── allocations/    # Check-out / check-in flow
│   │   │   ├── bookings/       # Shared-resource time-slot booking
│   │   │   ├── maintenance/    # Issue reporting & resolution
│   │   │   ├── audits/         # Audit cycles & verification
│   │   │   ├── organization/   # Departments, categories, employees
│   │   │   └── notifications/  # Dashboard KPIs & alerts
│   │   └── utils/             # Helpers (e.g. asset tag generator)
│   └── package.json
│
└── frontend/                # React frontend
    ├── src/
    │   ├── api/               # Axios API configuration
    │   ├── auth/               # Login, signup, role definitions
    │   ├── components/         # Reusable UI (Nav, Sidebar, Common)
    │   ├── context/             # Global state providers
    │   ├── pages/               # Top-level route views (Dashboard, Assets...)
    │   └── utils/                # Helpers (e.g. PDF export)
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Authentication & Authorization** | Secure login/signup with role-based routing (Admin, Asset Manager, Department Head, Employee) |
| 📦 **Asset Management** | Register, update, and track physical/digital assets with auto-generated tags (`AF-0001`...) |
| 🔄 **Allocations & Bookings** | Assign assets to employees/departments, or let users book shared assets — with double-allocation and overlap guards built in |
| 🛠️ **Maintenance Tracking** | Log, schedule, and resolve repairs; asset status updates automatically as requests progress |
| 🔍 **Auditing** | Run inventory audit cycles per department/location; flag Verified / Missing / Damaged items |
| 🏢 **Organization Management** | Manage departments (with hierarchy), asset categories, and employee records |
| 🔔 **Notifications & Dashboard** | Real-time-style alerts and at-a-glance KPIs (available/allocated assets, active bookings, pending maintenance) |
| 📄 **PDF Export** | Generate reports for asset lists, audits, and maintenance histories |

## 🔑 Backend API Reference

All routes are prefixed with `/api` and require a `Bearer` JWT token unless marked public.

| Module | Endpoint | Access |
|---|---|---|
| Auth | `POST /auth/signup` | Public |
| Auth | `POST /auth/login` | Public |
| Assets | `POST /assets` | Admin, Asset Manager |
| Assets | `GET /assets` | Authenticated |
| Allocations | `POST /allocations` | Admin, Asset Manager |
| Allocations | `POST /allocations/:id/return` | Admin, Asset Manager |
| Bookings | `POST /bookings` | Authenticated |
| Bookings | `GET /bookings` | Authenticated |
| Maintenance | `POST /maintenance` | Authenticated |
| Maintenance | `PATCH /maintenance/:id/status` | Admin, Asset Manager |
| Audits | `POST /audits/cycles` | Admin |
| Audits | `POST /audits/verify` | Authenticated |
| Audits | `PATCH /audits/cycles/:id/close` | Admin |
| Organization | `POST /org/departments` | Admin |
| Organization | `GET /org/departments` | Authenticated |
| Organization | `POST /org/categories` | Admin |
| Organization | `GET /org/categories` | Authenticated |
| Organization | `GET /org/employees` | Authenticated |
| Organization | `PATCH /org/employees/:id/role` | Admin |
| Notifications | `GET /notifications/dashboard-kpis` | Authenticated |
| Health | `GET /health` | Public |

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js
- A database system compatible with Prisma (PostgreSQL recommended)

### 1. Backend Setup

```bash
cd backend
npm install
```

**Environment configuration** — copy `.env.example` to `.env` and fill in your database connection string and secrets:

```env
DATABASE_URL=
DIRECT_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=5000
```

**Initialize the database** — generate the Prisma client and apply the schema:

```bash
npx prisma generate
npx prisma migrate dev
```

**Start the server:**

```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal (keep the backend running):

```bash
cd frontend
npm install
```

**Environment configuration** — copy `.env.example` to `.env` and point it at your running backend:

```env
VITE_API_URL=http://localhost:5000/api
```

**Start the application:**

```bash
npm run dev
```

## 📜 Available Scripts

<table>
<tr>
<td valign="top" width="50%">

**Backend** (`/backend`)
- `npm run dev` — Starts the development server

</td>
<td valign="top" width="50%">

**Frontend** (`/frontend`)
- `npm run dev` — Starts the Vite development server
- `npm run build` — Builds the app for production
- `npm run preview` — Serves the production build locally

</td>
</tr>
</table>

## 👥 Roles

| Role | Permissions |
|---|---|
| 🛡️ **Admin** | Full access — org setup, role management, audits |
| 🧰 **Asset Manager** | Register/allocate assets, manage maintenance |
| 🏢 **Department Head** | Departmental oversight |
| 👤 **Employee** | Book resources, raise maintenance requests |

## 🗺️ Roadmap Ideas

- Asset transfer requests between departments
- Expanded notification delivery (email/push)
- File uploads for asset photos and maintenance evidence
- QR-code check-in/check-out flow

---

<div align="center">

Built for **[Hackathon Name]** · 2026

</div>
