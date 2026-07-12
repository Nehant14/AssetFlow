const prisma = require('../../config/db');

async function createBooking({ assetId, userId, startTime, endTime }) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Overlap Validation Guard[cite: 1, 2]
  const overlapping = await prisma.booking.findFirst({
    where: {
      assetId,
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
    data: { assetId, bookedById: userId, startTime: start, endTime: end }
  });
}

module.exports = { createBooking };