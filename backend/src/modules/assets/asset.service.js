const prisma = require('../../config/db');

// Central status tracking engine used dynamically by other actions[cite: 1, 2]
async function updateAssetStatus(assetId, nextStatus) {
  return await prisma.asset.update({
    where: { id: assetId },
    data: { status: nextStatus }
  });
}

module.exports = { updateAssetStatus };