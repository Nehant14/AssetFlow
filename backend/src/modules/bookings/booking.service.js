const prisma = require('../../config/db');

async function createBooking({ assetId, userId, startTime, endTime }) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) throw new Error('Booking end time must be after start time.');

  const overlapping = await prisma.booking.findFirst({
    where: {
      assetId: Number(assetId),
      status: { in: ['Upcoming', 'Ongoing'] },
      NOT: [
        { endTime: { lte: start } },
        { startTime: { gte: end } }
      ]
    }
  });

  if (overlapping) {
    throw new Error('Overlap Validation Failed: This shared resource is already booked during this time frame.');
  }

  return await prisma.booking.create({
    data: { assetId: Number(assetId), bookedById: Number(userId), startTime: start, endTime: end }
  });
}

async function updateBooking(id, data, userId, isAdmin) {
  const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });
  if (!booking) throw new Error('Booking not found.');
  if (!isAdmin && booking.bookedById !== Number(userId)) throw new Error('You can only update your own bookings.');

  const start = data.startTime ? new Date(data.startTime) : booking.startTime;
  const end = data.endTime ? new Date(data.endTime) : booking.endTime;
  if (start >= end) throw new Error('Booking end time must be after start time.');

  const overlapping = await prisma.booking.findFirst({
    where: {
      assetId: booking.assetId,
      id: { not: Number(id) },
      status: { in: ['Upcoming', 'Ongoing'] },
      NOT: [
        { endTime: { lte: start } },
        { startTime: { gte: end } }
      ]
    }
  });

  if (overlapping) throw new Error('Overlap Validation Failed: This shared resource is already booked during this time frame.');

  return prisma.booking.update({
    where: { id: Number(id) },
    data: {
      startTime: start,
      endTime: end,
      status: data.status || booking.status
    }
  });
}

async function cancelBooking(id, userId, isAdmin) {
  const booking = await prisma.booking.findUnique({ where: { id: Number(id) } });
  if (!booking) throw new Error('Booking not found.');
  if (!isAdmin && booking.bookedById !== Number(userId)) throw new Error('You can only cancel your own bookings.');

  return prisma.booking.update({
    where: { id: Number(id) },
    data: { status: 'Cancelled' }
  });
}

module.exports = { createBooking, updateBooking, cancelBooking };