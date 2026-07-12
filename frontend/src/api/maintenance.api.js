import axiosClient from './axiosClient';

export const getMaintenanceRequests = () => axiosClient.get('/maintenance');
export const raiseMaintenanceRequest = (data) => axiosClient.post('/maintenance', data);
export const updateMaintenanceStatus = (id, status) => axiosClient.patch(`/maintenance/${id}/status`, { status });
