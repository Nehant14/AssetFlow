const prisma = require('../../config/db');

async function createAuditCycle({ departmentId, location, startDate, endDate, auditorIds = [] }) {
  return await prisma.auditCycle.create({
    data: {
      departmentId,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      auditors: {
        create: auditorIds.map(auditorId => ({ auditorId }))
      }
    }
  });
}

async function recordVerification({ auditCycleId, assetId, result, notes }) {
  return await prisma.auditItem.create({
    data: { auditCycleId, assetId, result, notes }
  });
}

async function closeCycle(id) {
  const closedCycle = await prisma.auditCycle.update({
    where: { id: Number(id) },
    data: { status: 'Closed' },
    include: { items: true }
  });

  // Auto update asset status based on discrepancies captured
  for (const item of closedCycle.items) {
    if (item.result === 'Missing') {
      await prisma.asset.update({ where: { id: item.assetId }, data: { status: 'Lost' } });
    }
  }

  return closedCycle;
}

module.exports = { createAuditCycle, recordVerification, closeCycle };