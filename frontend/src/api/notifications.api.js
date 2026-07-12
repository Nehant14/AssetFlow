import axiosClient from './axiosClient';

// The backend only mounts GET /api/notifications/dashboard-kpis (see
// notification.routes.js) — there is no personal-inbox list endpoint or
// mark-as-read endpoint, despite a `Notification` model existing in the
// schema. Calling `/notifications` or `/notifications/:id/read` 404s, so
// those calls were removed instead of left to fail silently on every page load.
export const getDashboardKPIs = () => axiosClient.get('/notifications/dashboard-kpis');
