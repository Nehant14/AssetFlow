import axiosClient from './axiosClient';

// GET /api/notifications/dashboard-kpis
// -> { totalAvailable, totalAllocated, activeBookings, pendingMaint }
// Note: the backend does not currently expose a per-user notification feed
// endpoint (no GET /api/notifications), even though a Notification model
// exists in the schema — only this dashboard KPI aggregate is wired up.
export const getDashboardKPIs = () => {
  return axiosClient.get('/notifications/dashboard-kpis');
};
