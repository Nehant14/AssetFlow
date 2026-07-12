// Role-Based Access Control (RBAC) configuration.
// Target users: Fleet Managers, Drivers, Safety Officers, Financial Analysts.
//
// This is the single source of truth the frontend uses to decide what each
// role can see and do. The backend must still enforce these rules
// server-side — this only controls the UI (hiding nav items, disabling
// buttons, blocking routes) for a clean role-appropriate experience.

export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const ALL_ROLES = Object.values(ROLES);

// Capability matrix. Every capability defaults to false for a role unless
// listed here.
const PERMISSIONS = {
  [ROLES.FLEET_MANAGER]: {
    viewDashboard: true,
    manageVehicles: true,
    manageDrivers: true,
    dispatchTrips: true,
    manageMaintenance: true,
    manageExpenses: true,
    viewReports: true,
    exportReports: true,
    manageReminders: true,
    manageDocuments: true,
    viewNotifications: true,
  },
  [ROLES.DRIVER]: {
    viewDashboard: true,
    manageVehicles: false,
    manageDrivers: false,
    dispatchTrips: false, // can view own trips, not dispatch new ones
    manageMaintenance: false,
    manageExpenses: false,
    viewReports: false,
    exportReports: false,
    manageReminders: false,
    manageDocuments: false,
    viewNotifications: true,
  },
  [ROLES.SAFETY_OFFICER]: {
    viewDashboard: true,
    manageVehicles: false,
    manageDrivers: true, // owns license/safety compliance
    dispatchTrips: false,
    manageMaintenance: true, // owns roadworthiness / maintenance cycles
    manageExpenses: false,
    viewReports: true,
    exportReports: false,
    manageReminders: true, // license expiry reminders are a safety concern
    manageDocuments: true, // vehicle compliance documents
    viewNotifications: true,
  },
  [ROLES.FINANCIAL_ANALYST]: {
    viewDashboard: true,
    manageVehicles: false,
    manageDrivers: false,
    dispatchTrips: false,
    manageMaintenance: false,
    manageExpenses: true,
    viewReports: true,
    exportReports: true,
    manageReminders: false,
    manageDocuments: false,
    viewNotifications: true,
  },
};

// Returns true/false for a given role + capability key.
export const can = (role, capability) => {
  return Boolean(PERMISSIONS[role]?.[capability]);
};

// Every route in the app, tagged with the capability required to see it.
// `null` means "any authenticated role".
export const ROUTE_CAPABILITY = {
  '/': null,
  '/vehicles': 'manageVehicles',
  '/vehicles/documents': 'manageDocuments',
  '/drivers': null, // everyone can view; manageDrivers gates edit actions inside the page
  '/trips': null, // everyone can view; dispatchTrips gates the dispatch form
  '/maintenance': null,
  '/fuel-expenses': 'manageExpenses',
  '/reports': 'viewReports',
  '/reminders': 'manageReminders',
  '/notifications': 'viewNotifications',
};
