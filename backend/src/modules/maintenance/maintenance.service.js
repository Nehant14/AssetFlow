const prisma = require('../../config/db');

// NOTE: the controller passes `requesterId`/`description` (matching the
// frontend's request shape), but the schema's MaintenanceRequest model
// actually has `raisedById` and `issue`. Mapped here so the Prisma call
// writes to the real columns.
async function createMaintenanceRequest({ assetId, requesterId, description, priority }) {
  return await prisma.maintenanceRequest.create({
    data: { assetId, raisedById: requesterId, issue: description, priority }
  });
}

async function updateMaintenanceStatus(id, status) {
  const record = await prisma.maintenanceRequest.update({
    where: { id: Number(id) },
    data: { status }
  });

  // Flip asset state accordingly based on approvals.
  // MaintenanceStatus/AssetStatus enum values are PascalCase with no
  // underscores (InProgress / UnderMaintenance), not In_Progress / Under_Maintenance.
  if (status === 'Approved' || status === 'InProgress') {
    await prisma.asset.update({ where: { id: record.assetId }, data: { status: 'UnderMaintenance' } });
  } else if (status === 'Resolved' || status === 'Rejected') {
    await prisma.asset.update({ where: { id: record.assetId }, data: { status: 'Available' } });
  }

  return record;
}

module.exports = { createMaintenanceRequest, updateMaintenanceStatus };