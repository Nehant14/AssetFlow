const prisma = require('../../config/db');
const { updateAssetStatus } = require('../assets/asset.service');

async function allocateAsset({ assetId, employeeId, departmentId, expectedReturnDate, userId }) {
  const asset = await prisma.asset.findUnique({ where: { id: Number(assetId) } });
  if (!asset) throw new Error('Asset not found.');

  const activeAllocation = await prisma.allocation.findFirst({ where: { assetId: Number(assetId), status: 'Active' } });
  if (activeAllocation) {
    const holder = await prisma.user.findUnique({ where: { id: activeAllocation.employeeId } });
    const holderName = holder?.name || 'another department';
    throw new Error(`Double Allocation Blocked! Asset is currently held by ${holderName}. Please request a Transfer.`);
  }

  if (asset.status !== 'Available' && asset.status !== 'Reserved') {
    throw new Error('Only available or reserved assets can be allocated.');
  }

  const allocation = await prisma.allocation.create({
    data: {
      assetId: Number(assetId),
      employeeId: employeeId ? Number(employeeId) : null,
      departmentId: departmentId ? Number(departmentId) : null,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : null
    }
  });

  await updateAssetStatus(Number(assetId), 'Allocated');
  if (employeeId) {
    await prisma.notification.create({ data: { userId: Number(employeeId), message: `Asset ${asset.name} has been assigned to you.` } });
  }
  if (userId) {
    await prisma.notification.create({ data: { userId: Number(userId), message: `Asset ${asset.name} allocated successfully.` } });
  }
  return allocation;
}

module.exports = { allocateAsset };