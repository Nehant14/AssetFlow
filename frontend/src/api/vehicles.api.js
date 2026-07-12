import axiosClient from './axiosClient';

export const getVehicles = (status) => {
  const query = status ? `?status=${status}` : '';
  return axiosClient.get(`/vehicles${query}`);
};

export const createVehicle = (vehicleData) => {
  return axiosClient.post('/vehicles', vehicleData);
};

export const updateVehicleStatus = (id, status) => {
  return axiosClient.patch(`/vehicles/${id}/status`, { status });
};