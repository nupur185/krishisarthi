import prisma from '../config/prisma.js';
import {
  PaymentStatus,
  NotificationType,
} from '@prisma/client';

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

// ============================================
// INITIATE PAYMENT
// ============================================

export async function initiatePayment(
  paymentId: number
) {
  const payment =
    await prisma.paymentRecord.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        procurement: {
          include: {
            booking: true,
          },
        },
      },
    });

  if (!payment) {
    throw new Error(
      'Payment record not found'
    );
  }

  if (
    payment.status !==
    PaymentStatus.PROCESSING
  ) {
    throw new Error(
      `Payment cannot be initiated from ${payment.status} status`
    );
  }

  const updatedPayment =
    await prisma.paymentRecord.update({
      where: {
        id: paymentId,
      },

      data: {
        status: PaymentStatus.INITIATED,
        initiatedAt: new Date(),
      },
    });

  await prisma.notification.create({
    data: {
      userId:
        payment.procurement.booking.userId,

      type:
        NotificationType.PAYMENT_UPDATE,

      title:
        'Payment Initiated',

      message:
        `Your procurement payment of ₹${Number(
          updatedPayment.amount
        ).toFixed(
          2
        )} has been initiated.`,

      paymentId:
        updatedPayment.id,
    },
  });

  return updatedPayment;
}

// ============================================
// CREDIT PAYMENT
// ============================================

export async function creditPayment(
  paymentId: number
) {
  const payment =
    await prisma.paymentRecord.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        procurement: {
          include: {
            booking: true,
          },
        },
      },
    });

  if (!payment) {
    throw new Error(
      'Payment record not found'
    );
  }

  if (
    payment.status !==
    PaymentStatus.INITIATED
  ) {
    throw new Error(
      `Payment cannot be credited from ${payment.status} status`
    );
  }

  const updatedPayment =
    await prisma.paymentRecord.update({
      where: {
        id: paymentId,
      },

      data: {
        status:
          PaymentStatus.CREDITED,

        creditedAt:
          new Date(),

        bankReference:
          payment.bankReference ??
          `KS-DEMO-${Date.now()}`,
      },
    });

  await prisma.notification.create({
    data: {
      userId:
        payment.procurement.booking.userId,

      type:
        NotificationType.PAYMENT_UPDATE,

      title:
        'Payment Credited',

      message:
        `Your procurement payment of ₹${Number(
          updatedPayment.amount
        ).toFixed(
          2
        )} has been credited to your bank account.`,

      paymentId:
        updatedPayment.id,
    },
  });

  return updatedPayment;
}

// ============================================
// FAIL PAYMENT
// ============================================

export async function failPayment(
  paymentId: number
) {
  const payment =
    await prisma.paymentRecord.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        procurement: {
          include: {
            booking: true,
          },
        },
      },
    });

  if (!payment) {
    throw new Error(
      'Payment record not found'
    );
  }

  if (
    payment.status !==
      PaymentStatus.PROCESSING &&
    payment.status !==
      PaymentStatus.INITIATED
  ) {
    throw new Error(
      `Payment cannot be marked failed from ${payment.status} status`
    );
  }

  const updatedPayment =
    await prisma.paymentRecord.update({
      where: {
        id: paymentId,
      },

      data: {
        status:
          PaymentStatus.FAILED,
      },
    });

  await prisma.notification.create({
    data: {
      userId:
        payment.procurement.booking.userId,

      type:
        NotificationType.PAYMENT_UPDATE,

      title:
        'Payment Failed',

      message:
        `Your procurement payment of ₹${Number(
          updatedPayment.amount
        ).toFixed(
          2
        )} could not be processed. Please check your payment details or contact support.`,

      paymentId:
        updatedPayment.id,
    },
  });

  return updatedPayment;
}