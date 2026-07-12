const prisma = require('../../config/db');

async function createMaintenanceRequest({ assetId, requesterId, description, priority }) {
  return await prisma.maintenance.create({
    data: { assetId, requesterId, description, priority }
  });
}

async function updateMaintenanceStatus(id, status) {
  const record = await prisma.maintenance.update({
    where: { id },
    data: { status }
  });

  // Flip asset state accordingly based on approvals
  if (status === 'Approved' || status === 'In_Progress') {
    await prisma.asset.update({ where: { id: record.assetId }, data: { status: 'Under_Maintenance' } });
  } else if (status === 'Resolved' || status === 'Rejected') {
    await prisma.asset.update({ where: { id: record.assetId }, data: { status: 'Available' } });
  }

  return record;
}

module.exports = { createMaintenanceRequest, updateMaintenanceStatus };