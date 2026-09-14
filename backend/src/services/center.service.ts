import prisma from '../config/prisma.js';

export async function getActiveCenters() {
  return prisma.procurementCenter.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: [
      {
        district: 'asc',
      },
      {
        name: 'asc',
      },
    ],
  });
}

export async function getCenterById(centerId: number) {
  return prisma.procurementCenter.findFirst({
    where: {
      id: centerId,
      status: 'ACTIVE',
    },
  });
}