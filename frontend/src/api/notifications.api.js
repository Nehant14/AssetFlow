import axiosClient from './axiosClient';

export const getNotifications = () => axiosClient.get('/notifications');
export const markAsRead = (id) => axiosClient.patch(`/notifications/${id}/read`);

// Bonus feature: Email reminders for expiring driver licenses.
// Backend is expected to compute drivers whose license expires within the
// given window (days) and to actually dispatch the reminder emails.
export const getExpiringLicenses = (withinDays = 30) =>
  axiosClient.get('/notifications/expiring-licenses', { params: { withinDays } });

export const sendLicenseReminder = (driverId) =>
  axiosClient.post(`/notifications/expiring-licenses/${driverId}/send`);

export const sendBulkLicenseReminders = (driverIds) =>
  axiosClient.post('/notifications/expiring-licenses/send-bulk', { driverIds });
