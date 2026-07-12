const allocationService = require('./allocation.service');
const prisma = require('../../config/db');

exports.createAllocation = async (req, res) => {
  try {
    const data = await allocationService.allocateAsset(req.body);
    res.status(201).json({ status: 'success', data });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};

exports.returnAsset = async (req, res) => {
  try {
    const { id } = req.params; // Allocation entry ID
    const { returnNotes } = req.body;

    const allocation = await prisma.allocation.update({
      where: { id: Number(id) },
      data: { status: 'Returned', returnedAt: new Date(), returnCondition: returnNotes }
    });

    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: 'Available' }
    });

    res.status(200).json({ status: 'success', message: 'Asset returned successfully.' });
  } catch (err) { res.status(400).json({ status: 'error', message: err.message }); }
};