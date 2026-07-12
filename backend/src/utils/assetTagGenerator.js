const prisma = require('../config/db');

// Generates incremental tags like AF-0001, AF-0002
async function generateAssetTag() {
  const count = await prisma.asset.count();
  const nextNumber = String(count + 1).padStart(4, '0');
  return `AF-${nextNumber}`;
}

module.exports = { generateAssetTag };