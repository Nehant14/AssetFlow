const prisma = require('../../config/db');

async function getDashboardKPIs() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalAvailable = await prisma.asset.count({ where: { status: 'Available' } });
  const totalAllocated = await prisma.asset.count({ where: { status: 'Allocated' } });
  const activeBookings = await prisma.booking.count({ where: { status: { in: ['Upcoming', 'Ongoing'] } } });
  const maintenanceToday = await prisma.maintenanceRequest.count({ where: { createdAt: { gte: today, lt: tomorrow } } });
  const pendingTransfers = await prisma.transfer.count({ where: { status: 'Requested' } });
  const upcomingReturns = await prisma.allocation.count({ where: { status: 'Active', expectedReturnDate: { gte: today } } });
  const overdueReturns = await prisma.allocation.count({ where: { status: 'Active', expectedReturnDate: { lt: today } } });

  return { totalAvailable, totalAllocated, activeBookings, maintenanceToday, pendingTransfers, upcomingReturns, overdueReturns };
}

async function getNotifications(userId) {
  return prisma.notification.findMany({ where: { userId: Number(userId) }, orderBy: { createdAt: 'desc' } });
}

async function markNotificationRead(id) {
  return prisma.notification.update({ where: { id: Number(id) }, data: { isRead: true } });
}

module.exports = { getDashboardKPIs, getNotifications, markNotificationRead };