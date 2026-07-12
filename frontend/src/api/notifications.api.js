import axiosClient from './axiosClient';

export const getDashboardKPIs = () => axiosClient.get('/notifications/dashboard-kpis');
export const getNotifications = () => axiosClient.get('/notifications');
export const markNotificationRead = (id) => axiosClient.patch(`/notifications/${id}/read`);
