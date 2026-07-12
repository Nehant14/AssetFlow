const prisma = require('../../config/db');
const { generateAssetTag } = require('../../utils/assetTagGenerator');

exports.registerAsset = async (req, res) => {
  try {
    const { serialNumber, tag: providedTag } = req.body;
    if (serialNumber) {
      const existingSerial = await prisma.asset.findFirst({ where: { serialNumber } });
      if (existingSerial) return res.status(409).json({ status: 'error', message: 'Duplicate serial number.' });
    }

    const tag = providedTag || await generateAssetTag();
    const existingTag = await prisma.asset.findUnique({ where: { tag } });
    if (existingTag) return res.status(409).json({ status: 'error', message: 'Duplicate asset tag.' });

    const asset = await prisma.asset.create({ data: { ...req.body, tag } });
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

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { serialNumber, tag: providedTag, status } = req.body;

    if (serialNumber) {
      const existingSerial = await prisma.asset.findFirst({ where: { serialNumber, NOT: { id: Number(id) } } });
      if (existingSerial) return res.status(409).json({ status: 'error', message: 'Duplicate serial number.' });
    }

    if (providedTag) {
      const existingTag = await prisma.asset.findFirst({ where: { tag: providedTag, NOT: { id: Number(id) } } });
      if (existingTag) return res.status(409).json({ status: 'error', message: 'Duplicate asset tag.' });
    }

    if (status) {
      const current = await prisma.asset.findUnique({ where: { id: Number(id) } });
      const validTransitions = {
        Available: ['Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'],
        Allocated: ['Available', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'],
        Reserved: ['Available', 'Allocated', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed'],
        UnderMaintenance: ['Available', 'Lost', 'Retired', 'Disposed'],
        Lost: ['Retired', 'Disposed'],
        Retired: [],
        Disposed: []
      };
      if (current && !validTransitions[current.status]?.includes(status)) {
        return res.status(409).json({ status: 'error', message: 'Invalid asset status transition.' });
      }
    }

    const asset = await prisma.asset.update({ where: { id: Number(id) }, data: req.body });
    res.status(200).json({ status: 'success', data: asset });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const activeAllocations = await prisma.allocation.count({ where: { assetId: Number(id), status: 'Active' } });
    if (activeAllocations) return res.status(409).json({ status: 'error', message: 'Cannot delete an asset with an active allocation.' });

    await prisma.asset.delete({ where: { id: Number(id) } });
    res.status(200).json({ status: 'success', message: 'Asset deleted.' });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};