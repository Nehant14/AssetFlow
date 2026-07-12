const prisma = require('../../config/db');
const { updateAssetStatus } = require('../assets/asset.service');

async function allocateAsset({ assetId, userId, departmentId, expectedReturnDate }) {
  // Explicit Conflict Guard Rule[cite: 1, 2]
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.status !== 'Available') {
    // Look up who holds it right now to deliver a customized error[cite: 1]
    const currentHolder = await prisma.allocation.findFirst({
      where: { assetId, isActive: true },
      include: { user: true }
    });
    const holderName = currentHolder?.user?.name || 'another department';
    throw new Error(`Double Allocation Blocked! Asset is currently held by ${holderName}. Please request a Transfer.`);
  }

  const allocation = await prisma.allocation.create({
    data: { assetId, userId, departmentId, expectedReturnDate: new Date(expectedReturnDate) }
  });

  await updateAssetStatus(assetId, 'Allocated');
  return allocation;
}

module.exports = { allocateAsset };