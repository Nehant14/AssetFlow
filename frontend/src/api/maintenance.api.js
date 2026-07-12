import axiosClient from './axiosClient';

// POST /api/maintenance — any authenticated user can raise a request
// body: { assetId, description, priority }
export const raiseMaintenanceRequest = (data) => {
  return axiosClient.post('/maintenance', data);
};

// PATCH /api/maintenance/:id/status (Admin, AssetManager)
export const updateMaintenanceStatus = (id, status) => {
  return axiosClient.patch(`/maintenance/${id}/status`, { status });
};
