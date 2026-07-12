const prisma = require('../../config/db');

// NOTE: the frontend form collects a "Cycle Name", but AuditCycle has no
// name column in the schema — only departmentId/location/startDate/endDate.
// It's simply not persisted (nothing to map it to) until the schema grows
// one; every other field below is written to its real column.
async function createAuditCycle({ startDate, endDate, departmentId, location, auditorIds = [] }) {
  const cycle = await prisma.auditCycle.create({
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      departmentId: departmentId ? Number(departmentId) : undefined,
      location,
    }
  });

  // `auditors` is not a direct many-to-many relation on AuditCycle — it's a
  // one-to-many to the AuditAssignment join model, so it can't be filled
  // with a `connect`. Create the join rows explicitly instead.
  if (auditorIds.length) {
    await prisma.auditAssignment.createMany({
      data: auditorIds.map((auditorId) => ({ auditCycleId: cycle.id, auditorId: Number(auditorId) })),
      skipDuplicates: true,
    });
  }

  return cycle;
}

async function recordVerification({ auditCycleId, assetId, status, notes }) {
  // The model is AuditItem (not AuditRecord), and its field is `result`
  // (AuditResult enum: Verified/Missing/Damaged), not `status`.
  return await prisma.auditItem.create({
    data: { auditCycleId: Number(auditCycleId), assetId: Number(assetId), result: status, notes }
  });
}

async function closeCycle(id) {
  // AuditCycle tracks state via `status: AuditStatus` (Open/Closed), not an
  // `isClosed` boolean, and its verification records live under `items`
  // (AuditItem[]), not `records`.
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