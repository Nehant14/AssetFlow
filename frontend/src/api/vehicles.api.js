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

export const updateVehicle = (id, vehicleData) => {
  return axiosClient.put(`/vehicles/${id}`, vehicleData);
};

// Bonus feature: Vehicle document management (RC, Insurance, Permit, PUC, etc.)
export const getVehicleDocuments = (vehicleId) => {
  const query = vehicleId ? `?vehicleId=${vehicleId}` : '';
  return axiosClient.get(`/vehicles/documents${query}`);
};

export const uploadVehicleDocument = (vehicleId, docData) => {
  // docData: { type, documentNumber, expiryDate, file }
  const form = new FormData();
  Object.entries(docData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  return axiosClient.post(`/vehicles/${vehicleId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteVehicleDocument = (vehicleId, documentId) => {
  return axiosClient.delete(`/vehicles/${vehicleId}/documents/${documentId}`);
};
