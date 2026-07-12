
AssetFlow
AssetFlow is a robust, full-stack asset management system designed to streamline the tracking, allocation, and maintenance of organizational resources. It features a comprehensive Role-Based Access Control (RBAC) architecture to ensure secure management across different departments, employees, and asset lifecycles.

🛠 Tech Stack
Frontend:

Framework: React with Vite

Styling: Tailwind CSS (with PostCSS)

Routing: React Router v6 (Protected & Role-based routes)

API Communication: Axios (modularized client setup)

Backend:

Runtime: Node.js

Database ORM: Prisma

Authentication: JWT-based Auth with RBAC middleware

✨ Key Features
Asset Management: Track complete asset lifecycles, categorize inventory, and automatically generate unique asset tags (assetTagGenerator.js).

Organization & HR Mapping: Manage departments, employee records, and structural categories seamlessly.

Allocations & Bookings: Assign permanent assets to employees or manage temporary asset booking requests.

Maintenance Tracking: Schedule, log, and monitor asset maintenance and repair histories.

Audit System: Conduct system and inventory audits to ensure compliance and track asset conditions.

Role-Based Access Control (RBAC): Granular permissions ensuring users only see and interact with what their role permits (e.g., Admin, Manager, Employee).

Notifications: Built-in notification service to alert users of booking statuses, maintenance schedules, or allocation updates.

Data Export: Export tabular data and reports directly to PDF formats (pdfExport.js).

📂 Project Structure
The repository is organized into a monorepo-style structure separating the client and server.

Plaintext
AssetFlow/
├── backend/                  # Node.js API Server
│   ├── prisma/               # Database schemas and migrations
│   ├── src/
│   │   ├── config/           # Database and environment configs
│   │   ├── middlewares/      # Auth, Error Handling, and RBAC guards
│   │   ├── modules/          # Domain-driven feature modules (Assets, Audits, Auth, Bookings, etc.)
│   │   ├── utils/            # Helper functions (Asset Tag Generator)
│   │   ├── app.js            # Express app initialization
│   │   └── server.js         # Server entry point
│   └── package.json
│
└── frontend/                 # React UI Application
    ├── src/
    │   ├── api/              # Axios API clients mirroring backend modules
    │   ├── auth/             # Login/Signup logic and role definitions
    │   ├── components/       # Reusable UI, Navbars, Sidebars, and Route Guards
    │   ├── context/          # Global state (AuthContext, ThemeContext)
    │   ├── hooks/            # Custom React hooks (e.g., useTableControls)
    │   ├── pages/            # View components (Dashboard, Assets, Allocations, etc.)
    │   ├── routes/           # Application routing logic
    │   └── utils/            # Frontend helpers (PDF Export)
    ├── tailwind.config.js    # Tailwind configuration
    ├── vite.config.js        # Vite bundler configuration
    └── package.json
🚀 Getting Started
Follow these steps to set up the project locally for development.

Prerequisites
Node.js (v16 or higher)

A SQL database (PostgreSQL/MySQL) compatible with your Prisma configuration

1. Backend Setup
Navigate to the backend directory:

Bash
cd backend
Install dependencies:

Bash
npm install
Set up environment variables:
Copy .env.example to a new file named .env and fill in your database connection string and JWT secrets.

Bash
cp .env.example .env
Run database migrations to establish the schema:

Bash
npx prisma migrate dev
Start the development server:

npm run dev
2. Frontend Setup
Navigate to the frontend directory:


cd frontend
Install dependencies:


npm install
Set up environment variables:
Copy .env.example to a new file named .env and ensure VITE_API_URL points to your backend (default is usually http://localhost:5000/api).


cp .env.example .env
Start the frontend development server:


npm run dev
🛡 Security & Authentication
AssetFlow uses JWT (JSON Web Tokens) for authenticating users.

Backend: Routes are protected using auth.middleware.js, and specific actions are restricted using rbac.middleware.js.

Frontend: Unauthenticated users are redirected to the Login page via <ProtectedRoute/>, and role-specific views are handled by <RoleRoute/>.


