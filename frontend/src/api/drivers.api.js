import axiosClient from './axiosClient';

// Maintain driver profiles (3.4 Driver Management)
export const getDrivers = (status) => {
  const query = status ? `?status=${status}` : '';
  return axiosClient.get(`/drivers${query}`);
};

export const createDriver = (driverData) => {
  return axiosClient.post('/drivers', driverData);
};

export const updateDriverStatus = (id, status) => {
  return axiosClient.patch(`/drivers/${id}/status`, { status });
};

export const updateDriver = (id, driverData) => {
  return axiosClient.put(`/drivers/${id}`, driverData);
};
