import prisma from '../config/prisma.js';

export async function getCommodityPrices() {
  return prisma.commodityPrice.findMany({
    orderBy: [
      { commodity: 'asc' },
      { marketName: 'asc' },
    ],
  });
}

export async function getCommodityPricesByCommodity(
  commodity: string
) {
  return prisma.commodityPrice.findMany({
    where: {
      commodity: {
        equals: commodity,
        mode: 'insensitive',
      },
    },
    orderBy: {
      marketName: 'asc',
    },
  });
}

export async function getCommodityPricesByDistrict(
  district: string
) {
  return prisma.commodityPrice.findMany({
    where: {
      district: {
        equals: district,
        mode: 'insensitive',
      },
    },
    orderBy: [
      { commodity: 'asc' },
      { marketName: 'asc' },
    ],
  });
}