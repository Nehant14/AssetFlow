import axiosClient from './axiosClient';

export const getNotifications = () => axiosClient.get('/notifications');
export const markAsRead = (id) => axiosClient.patch(`/notifications/${id}/read`);