const prisma = require('../../config/db');

async function getDashboardKPIs() {
  const totalAvailable = await prisma.asset.count({ where: { status: 'Available' } });
  const totalAllocated = await prisma.asset.count({ where: { status: 'Allocated' } });
  const activeBookings = await prisma.booking.count({ where: { status: 'Ongoing' } });
  const pendingMaint = await prisma.maintenanceRequest.count({ where: { status: 'Pending' } });

  return { totalAvailable, totalAllocated, activeBookings, pendingMaint };
}

module.exports = { getDashboardKPIs };