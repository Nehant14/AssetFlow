// Role-Based Access Control (RBAC) configuration.
// Matches the backend's `Role` enum exactly: Admin, AssetManager,
// DepartmentHead, Employee (see prisma/schema.prisma).
//
// This is the single source of truth the frontend uses to decide what each
// role can see and do. The backend must still enforce these rules
// server-side (via restrictTo(...) on routes) — this only controls the UI
// (hiding forms/buttons, blocking routes) for a clean role-appropriate
// experience.

export const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'AssetManager',
  DEPARTMENT_HEAD: 'DepartmentHead',
  EMPLOYEE: 'Employee',
};

export const ALL_ROLES = Object.values(ROLES);

// Capability matrix. Every capability defaults to false for a role unless
// listed here. Most GET endpoints in this API are open to any authenticated
// user — the real gating in the backend happens on mutations (create/update),
// which is what this matrix mirrors.
const PERMISSIONS = {
  [ROLES.ADMIN]: {
    viewDashboard: true,
    manageAssets: true,
    manageAllocations: true,
    createBooking: true,
    raiseMaintenance: true,
    manageMaintenanceStatus: true,
    manageAudits: true,
    recordAuditVerification: true,
    manageOrganization: true,
    viewNotifications: true,
  },
  [ROLES.ASSET_MANAGER]: {
    viewDashboard: true,
    manageAssets: true,
    manageAllocations: true,
    createBooking: true,
    raiseMaintenance: true,
    manageMaintenanceStatus: true,
    manageAudits: false,
    recordAuditVerification: true,
    manageOrganization: false,
    viewNotifications: true,
  },
  [ROLES.DEPARTMENT_HEAD]: {
    viewDashboard: true,
    manageAssets: false,
    manageAllocations: false,
    createBooking: true,
    raiseMaintenance: true,
    manageMaintenanceStatus: false,
    manageAudits: false,
    recordAuditVerification: true,
    manageOrganization: false,
    viewNotifications: true,
  },
  [ROLES.EMPLOYEE]: {
    viewDashboard: true,
    manageAssets: false,
    manageAllocations: false,
    createBooking: true,
    raiseMaintenance: true,
    manageMaintenanceStatus: false,
    manageAudits: false,
    recordAuditVerification: false,
    manageOrganization: false,
    viewNotifications: true,
  },
};

// Returns true/false for a given role + capability key.
export const can = (role, capability) => {
  return Boolean(PERMISSIONS[role]?.[capability]);
};

// Every route in the app, tagged with the capability required to see it.
// `null` means "any authenticated role" — most pages here are readable by
// everyone since the underlying GET endpoints aren't role-restricted;
// individual forms/buttons inside each page are gated with `can(...)`.
export const ROUTE_CAPABILITY = {
  '/': null,
  '/assets': null,
  '/allocations': null,
  '/bookings': null,
  '/maintenance': null,
  '/audits': null,
  '/organization': null,
  '/notifications': null,
};
