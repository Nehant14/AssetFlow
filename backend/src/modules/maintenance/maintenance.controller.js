const prisma = require('../../config/db');

async function createAuditCycle({ name, startDate, endDate, auditorIds }) {
  return await prisma.auditCycle.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      auditors: { connect: auditorIds.map(id => ({ id })) }
    }
  });
}

async function recordVerification({ auditCycleId, assetId, status, notes }) {
  return await prisma.auditRecord.create({
    data: { auditCycleId, assetId, status, notes }
  });
}

async function closeCycle(id) {
  const closedCycle = await prisma.auditCycle.update({
    where: { id },
    data: { isClosed: true },
    include: { records: true }
  });

  // Auto update asset status based on discrepancies captured
  for (const rec of closedCycle.records) {
    if (rec.status === 'Missing') {
      await prisma.asset.update({ where: { id: rec.assetId }, data: { status: 'Lost' } });
    }
  }

  return closedCycle;
}

module.exports = { createAuditCycle, recordVerification, closeCycle };