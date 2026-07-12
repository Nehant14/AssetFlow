import axiosClient from './axiosClient';

export const getMaintenanceLogs = () => axiosClient.get('/maintenance');
export const createMaintenanceLog = (logData) => axiosClient.post('/maintenance', logData);
export const closeMaintenanceLog = (id) => axiosClient.patch(`/maintenance/${id}/close`);