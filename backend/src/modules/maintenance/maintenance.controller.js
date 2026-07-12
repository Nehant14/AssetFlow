const prisma = require('../../config/db');

async function raiseRequest(req, res) {
  try {
    const { assetId, issue, priority } = req.body;
    const request = await prisma.maintenanceRequest.create({
      data: {
        assetId: Number(assetId),
        raisedById: req.user.id,
        issue,
        priority: priority || 'Medium'
      }
    });
    res.status(201).json({ status: 'success', data: request });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

async function getMaintenanceRequests(req, res) {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      include: { asset: true, raisedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ status: 'success', data: requests });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await prisma.maintenanceRequest.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.status(200).json({ status: 'success', data: request });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
}

module.exports = { raiseRequest, getMaintenanceRequests, updateStatus };