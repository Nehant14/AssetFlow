const prisma = require('../../config/db');
const { updateAssetStatus } = require('../assets/asset.service');

// NOTE: the frontend's request body uses `userId` (see allocations.api.js /
// Allocations page), but the schema's relation field on Allocation is
// `employeeId`. Accepting `userId` here and mapping it to `employeeId` keeps
// the existing frontend contract intact while writing to the correct column.
async function allocateAsset({ assetId, userId, departmentId, expectedReturnDate }) {
  const employeeId = userId;

  // Explicit Conflict Guard Rule[cite: 1, 2]
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.status !== 'Available') {
    // Look up who holds it right now to deliver a customized error[cite: 1]
    const currentHolder = await prisma.allocation.findFirst({
      where: { assetId, status: 'Active' },
      include: { employee: true, department: true }
    });
    const holderName = currentHolder?.employee?.name || currentHolder?.department?.name || 'another department';
    throw new Error(`Double Allocation Blocked! Asset is currently held by ${holderName}. Please request a Transfer.`);
  }

  const allocation = await prisma.allocation.create({
    data: { assetId, employeeId, departmentId, expectedReturnDate: new Date(expectedReturnDate) }
  });

  await updateAssetStatus(assetId, 'Allocated');
  return allocation;
}

module.exports = { allocateAsset };