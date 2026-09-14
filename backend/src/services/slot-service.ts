import prisma from '../config/prisma.js';

export async function getAvailableSlotsForCenter(
  centerId: number
) {
  return prisma.slot.findMany({
    where: {
      centerId,
      status: 'AVAILABLE',
      slotDate: {
        gte: new Date(),
      },
    },
    orderBy: [
      {
        slotDate: 'asc',
      },
      {
        startTime: 'asc',
      },
    ],
    include: {
      center: true,
    },
  });
}