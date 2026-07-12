const prisma = require('../../config/db');

// NOTE: the controller passes `requesterId`/`description` (matching the
// frontend's request shape), but the schema's MaintenanceRequest model
// actually has `raisedById` and `issue`. Mapped here so the Prisma call
// writes to the real columns.
async function createMaintenanceRequest({ assetId, requesterId, description, priority }) {
  return await prisma.maintenanceRequest.create({
    data: { assetId: Number(assetId), raisedById: Number(requesterId), issue: description, priority: priority || 'Medium' }
  });
}

async function updateMaintenanceStatus(id, status) {
  const record = await prisma.maintenanceRequest.update({ where: { id: Number(id) }, data: { status } });

  if (status === 'Approved' || status === 'InProgress' || status === 'TechnicianAssigned') {
    await prisma.asset.update({ where: { id: record.assetId }, data: { status: 'UnderMaintenance' } });
  } else if (status === 'Resolved' || status === 'Rejected') {
    await prisma.asset.update({ where: { id: record.assetId }, data: { status: 'Available' } });
  }

  if (status === 'Approved') {
    await prisma.notification.create({ data: { userId: record.raisedById, message: 'Your maintenance request was approved.' } });
  } else if (status === 'Rejected') {
    await prisma.notification.create({ data: { userId: record.raisedById, message: 'Your maintenance request was rejected.' } });
  }

  return record;
}

module.exports = { createMaintenanceRequest, updateMaintenanceStatus };