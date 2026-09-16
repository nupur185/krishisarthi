import prisma from '../config/prisma.js';
import { PaymentStatus } from '@prisma/client';

export async function getPaymentById(paymentId: number) {
  return prisma.paymentRecord.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      procurement: {
        include: {
          booking: {
            include: {
              user: true,
              slot: {
                include: {
                  center: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getAllPayments() {
  return prisma.paymentRecord.findMany({
    include: {
      procurement: {
        include: {
          booking: {
            include: {
              user: true,
              slot: {
                include: {
                  center: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function initiatePayment(paymentId: number) {
  const payment = await prisma.paymentRecord.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (payment.status !== PaymentStatus.PROCESSING) {
    throw new Error(
      `Payment cannot be initiated from ${payment.status} status`
    );
  }

  return prisma.paymentRecord.update({
    where: {
      id: paymentId,
    },
    data: {
      status: PaymentStatus.INITIATED,
      initiatedAt: new Date(),
    },
  });
}

export async function creditPayment(paymentId: number) {
  const payment = await prisma.paymentRecord.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (payment.status !== PaymentStatus.INITIATED) {
    throw new Error(
      `Payment cannot be credited from ${payment.status} status`
    );
  }

  return prisma.paymentRecord.update({
    where: {
      id: paymentId,
    },
    data: {
      status: PaymentStatus.CREDITED,
      creditedAt: new Date(),
      bankReference:
        payment.bankReference ?? `KS-DEMO-${Date.now()}`,
    },
  });
}

export async function failPayment(paymentId: number) {
  const payment = await prisma.paymentRecord.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  if (
    payment.status !== PaymentStatus.PROCESSING &&
    payment.status !== PaymentStatus.INITIATED
  ) {
    throw new Error(
      `Payment cannot be marked failed from ${payment.status} status`
    );
  }

  return prisma.paymentRecord.update({
    where: {
      id: paymentId,
    },
    data: {
      status: PaymentStatus.FAILED,
    },
  });
}