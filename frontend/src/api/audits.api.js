import axiosClient from './axiosClient';

// POST /api/audits/cycles (Admin only)
// body: { name, startDate, endDate, auditorIds }
export const createAuditCycle = (data) => {
  return axiosClient.post('/audits/cycles', data);
};

// POST /api/audits/verify — any authenticated user (e.g. an assigned auditor)
// body: { auditCycleId, assetId, status, notes }
export const recordVerification = (data) => {
  return axiosClient.post('/audits/verify', data);
};

// PATCH /api/audits/cycles/:id/close (Admin only)
export const closeAuditCycle = (id) => {
  return axiosClient.patch(`/audits/cycles/${id}/close`);
};
