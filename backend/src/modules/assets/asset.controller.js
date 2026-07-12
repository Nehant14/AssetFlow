const prisma = require('../../config/db');
const { generateAssetTag } = require('../../utils/assetTagGenerator');

exports.registerAsset = async (req, res) => {
  try {
    const tag = await generateAssetTag();
    const asset = await prisma.asset.create({
      data: { ...req.body, tag }
    });
    res.status(201).json({ status: 'success', data: asset });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.getAssets = async (req, res) => {
  const { search, category, status } = req.query;
  const whereClause = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { tag: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (category) whereClause.categoryId = Number(category);
  if (status) whereClause.status = status;

  const assets = await prisma.asset.findMany({
    where: whereClause,
    include: { category: true, allocations: true, maintenanceRequests: true }
  });
  res.status(200).json({ status: 'success', data: assets });
};