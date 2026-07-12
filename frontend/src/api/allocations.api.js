import axiosClient from './axiosClient';

// POST /api/allocations (Admin, AssetManager)
// body: { assetId, userId, departmentId, expectedReturnDate }
export const createAllocation = (allocationData) => {
  return axiosClient.post('/allocations', allocationData);
};

// POST /api/allocations/:id/return (Admin, AssetManager)
export const returnAllocation = (id, returnNotes) => {
  return axiosClient.post(`/allocations/${id}/return`, { returnNotes });
};
