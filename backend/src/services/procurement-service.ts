import { Prisma, NotificationType, } from '@prisma/client';

import prisma from '../config/prisma.js';

// ============================================
// TYPES
// ============================================

export interface QualityInput {
  moisturePercent: number;
  foreignMatterPercent: number;
  damagedGrainsPercent: number;
  qualityGrade: 'A' | 'B' | 'C' | 'REJECTED';
}

export interface WeightInput {
  grossWeightQuintals: number;
  tareWeightQuintals: number;
}

export interface FinalizationInput {
  acceptedQuantityQuintals: number;
  mspPerQuintal: number;
}

// ============================================
// TYPES FOR PRISMA QUERY RESULTS
// ============================================

type MyProcurementBooking = Prisma.BookingGetPayload<{
  include: {
    procurement: {
      include: {
        payment: true;
      };
    };
    slot: {
      include: {
        center: true;
      };
    };
  };
}>;

// ============================================
// HELPERS
// ============================================

function decimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

// ============================================
// GET PROCUREMENT RECORD
// ============================================

export async function getProcurementByBookingId(
  bookingId: number
) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },

    include: {
      procurement: true,

      user: {
        select: {
          farmerId: true,
          fullName: true,
          mobile: true,
        },
      },

      slot: {
        include: {
          center: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  let procurement = booking.procurement;

  // Create the procurement record lazily
  // when it does not already exist.
  if (!procurement) {
    procurement = await prisma.procurementRecord.create({
      data: {
        bookingId: booking.id,
      },
    });
  }

  return {
    booking: {
      id: booking.id,
      bookingId: booking.bookingId,
      commodity: booking.commodity,
      quantityQuintals: booking.quantityQuintals,
      tokenNumber: booking.tokenNumber,
      tokenStatus: booking.tokenStatus,
      status: booking.status,
    },

    farmer: booking.user,

    center: {
      id: booking.slot.center.id,
      name: booking.slot.center.name,
    },

    slot: {
      slotDate: booking.slot.slotDate,
      startTime: booking.slot.startTime,
      endTime: booking.slot.endTime,
    },

    procurement,
  };
}

// ============================================
// GET MY PROCUREMENT + PAYMENT STATUS
// ============================================

export async function getMyProcurement(userId: number) {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
    },

    orderBy: {
      bookedAt: 'desc',
    },

    include: {
      procurement: {
        include: {
          payment: true,
        },
      },

      slot: {
        include: {
          center: true,
        },
      },
    },
  });

  return bookings.map((booking: MyProcurementBooking) => ({
    booking: {
      id: booking.id,
      bookingId: booking.bookingId,
      commodity: booking.commodity,
      quantityQuintals: booking.quantityQuintals,
      tokenNumber: booking.tokenNumber,
      tokenStatus: booking.tokenStatus,
      status: booking.status,
      bookedAt: booking.bookedAt,
    },

    center: {
      id: booking.slot.center.id,
      name: booking.slot.center.name,
      address: booking.slot.center.address,
      village: booking.slot.center.village,
      district: booking.slot.center.district,
      state: booking.slot.center.state,
    },

    slot: {
      slotDate: booking.slot.slotDate,
      startTime: booking.slot.startTime,
      endTime: booking.slot.endTime,
    },

    // ========================================
    // PROCUREMENT + PAYMENT
    // ========================================
    // Payment is intentionally nested inside
    // procurement because the farmer app reads:
    //
    // latestRecord.procurement.payment.status
    //
    procurement: booking.procurement
      ? {
          id: booking.procurement.id,

          moisturePercent:
            booking.procurement.moisturePercent,

          foreignMatterPercent:
            booking.procurement.foreignMatterPercent,

          damagedGrainsPercent:
            booking.procurement.damagedGrainsPercent,

          qualityGrade:
            booking.procurement.qualityGrade,

          grossWeightQuintals:
            booking.procurement.grossWeightQuintals,

          tareWeightQuintals:
            booking.procurement.tareWeightQuintals,

          netWeightQuintals:
            booking.procurement.netWeightQuintals,

          acceptedQuantityQuintals:
            booking.procurement.acceptedQuantityQuintals,

          mspPerQuintal:
            booking.procurement.mspPerQuintal,

          procurementAmount:
            booking.procurement.procurementAmount,

          status:
            booking.procurement.status,

          completedAt:
            booking.procurement.completedAt,

          payment: booking.procurement.payment
            ? {
                id: booking.procurement.payment.id,

                amount:
                  booking.procurement.payment.amount,

                status:
                  booking.procurement.payment.status,

                bankReference:
                  booking.procurement.payment.bankReference,

                initiatedAt:
                  booking.procurement.payment.initiatedAt,

                creditedAt:
                  booking.procurement.payment.creditedAt,
              }
            : null,
        }
      : null,
  }));
}

// ============================================
// SAVE QUALITY CHECK
// ============================================

export async function updateQuality(
  bookingId: number,
  input: QualityInput
) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Quality check is only allowed
  // when the farmer is currently being served.
  if (booking.tokenStatus !== 'SERVING') {
    throw new Error(
      'Quality check can only be performed when the token is being served'
    );
  }

  // Validate moisture
  if (
    input.moisturePercent < 0 ||
    input.moisturePercent > 100
  ) {
    throw new Error(
      'Moisture percentage must be between 0 and 100'
    );
  }

  // Validate foreign matter
  if (
    input.foreignMatterPercent < 0 ||
    input.foreignMatterPercent > 100
  ) {
    throw new Error(
      'Foreign matter percentage must be between 0 and 100'
    );
  }

  // Validate damaged grains
  if (
    input.damagedGrainsPercent < 0 ||
    input.damagedGrainsPercent > 100
  ) {
    throw new Error(
      'Damaged grains percentage must be between 0 and 100'
    );
  }

  // Validate grade
  const validGrades = [
    'A',
    'B',
    'C',
    'REJECTED',
  ];

  if (!validGrades.includes(input.qualityGrade)) {
    throw new Error('Invalid quality grade');
  }
     const existingProcurement =
  await prisma.procurementRecord.findUnique({
    where: {
      bookingId,
    },
    select: {
      status: true,
    },
  });

  const procurement =
    await prisma.procurementRecord.upsert({
      where: {
        bookingId,
      },

      create: {
        bookingId,

        moisturePercent: decimal(
          input.moisturePercent
        ),

        foreignMatterPercent: decimal(
          input.foreignMatterPercent
        ),

        damagedGrainsPercent: decimal(
          input.damagedGrainsPercent
        ),

        qualityGrade:
          input.qualityGrade,

        status: 'QUALITY_CHECK',
      },

      update: {
        moisturePercent: decimal(
          input.moisturePercent
        ),

        foreignMatterPercent: decimal(
          input.foreignMatterPercent
        ),

        damagedGrainsPercent: decimal(
          input.damagedGrainsPercent
        ),

        qualityGrade:
          input.qualityGrade,

        status: 'QUALITY_CHECK',
      },
    });

    if (existingProcurement?.status !== 'QUALITY_CHECK') {
  await prisma.notification.create({
    data: {
      userId: booking.userId,
      type: NotificationType.PROCUREMENT_UPDATE,
      title: 'Quality Check Completed',
      message: `Quality check for token ${booking.tokenNumber} has been completed. Grade: ${input.qualityGrade}.`,
      bookingId: booking.id,
    },
  });
}
  return procurement;
}

// ============================================
// SAVE WEIGHTMENT
// ============================================

export async function updateWeight(
  bookingId: number,
  input: WeightInput
) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Gross weight validation
  if (input.grossWeightQuintals <= 0) {
    throw new Error(
      'Gross weight must be greater than zero'
    );
  }

  // Tare weight validation
  if (input.tareWeightQuintals < 0) {
    throw new Error(
      'Tare weight cannot be negative'
    );
  }

  // Tare cannot be equal to
  // or greater than gross weight.
  if (
    input.tareWeightQuintals >=
    input.grossWeightQuintals
  ) {
    throw new Error(
      'Tare weight must be less than gross weight'
    );
  }

  // Calculate net weight
  const netWeight =
    input.grossWeightQuintals -
    input.tareWeightQuintals;

  if (netWeight <= 0) {
    throw new Error(
      'Net weight must be greater than zero'
    );
  }
 const existingProcurement =
  await prisma.procurementRecord.findUnique({
    where: {
      bookingId,
    },
    select: {
      status: true,
    },
  }); 

  const procurement =
    await prisma.procurementRecord.upsert({
      where: {
        bookingId,
      },

      create: {
        bookingId,

        grossWeightQuintals:
          decimal(
            input.grossWeightQuintals
          ),

        tareWeightQuintals:
          decimal(
            input.tareWeightQuintals
          ),

        netWeightQuintals:
          decimal(netWeight),

        status: 'WEIGHTMENT',
      },

      update: {
        grossWeightQuintals:
          decimal(
            input.grossWeightQuintals
          ),

        tareWeightQuintals:
          decimal(
            input.tareWeightQuintals
          ),

        netWeightQuintals:
          decimal(netWeight),

        status: 'WEIGHTMENT',
      },
    });

    if (existingProcurement?.status !== 'WEIGHTMENT') {
  await prisma.notification.create({
    data: {
      userId: booking.userId,
      type: NotificationType.PROCUREMENT_UPDATE,
      title: 'Weightment Completed',
      message: `Weightment for token ${booking.tokenNumber} has been completed. Net weight: ${netWeight.toFixed(2)} quintals.`,
      bookingId: booking.id,
    },
  });
}

  return procurement;
}

// ============================================
// FINALIZE PROCUREMENT
// ============================================

export async function finalizeProcurement(
  bookingId: number,
  input: FinalizationInput
) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },

    include: {
      procurement: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!booking.procurement) {
    throw new Error(
      'Quality and weightment must be completed before finalization'
    );
  }

  if (!booking.procurement.netWeightQuintals) {
    throw new Error(
      'Weightment must be completed before finalization'
    );
  }

  // Accepted quantity validation
  if (
    input.acceptedQuantityQuintals <= 0
  ) {
    throw new Error(
      'Accepted quantity must be greater than zero'
    );
  }

  // MSP validation
  if (input.mspPerQuintal <= 0) {
    throw new Error(
      'MSP must be greater than zero'
    );
  }

  // Accepted quantity cannot exceed
  // actual net weight.
  if (
    input.acceptedQuantityQuintals >
    Number(
      booking.procurement.netWeightQuintals
    )
  ) {
    throw new Error(
      'Accepted quantity cannot exceed net weight'
    );
  }

  // Calculate procurement amount
  const amount =
    input.acceptedQuantityQuintals *
    input.mspPerQuintal;

  const previousStatus =
  booking.procurement.status;

const procurement =
  await prisma.procurementRecord.update({
    where: {
      bookingId,
    },

    data: {
      acceptedQuantityQuintals:
        decimal(
          input.acceptedQuantityQuintals
        ),

      mspPerQuintal:
        decimal(
          input.mspPerQuintal
        ),

      procurementAmount:
        decimal(amount),

      status: 'FINALIZATION',
    },
  });

if (previousStatus !== 'FINALIZATION') {
  await prisma.notification.create({
    data: {
      userId: booking.userId,
      type: NotificationType.PROCUREMENT_UPDATE,
      title: 'Procurement Finalized',
      message: `Procurement for token ${booking.tokenNumber} has been finalized. Accepted quantity: ${input.acceptedQuantityQuintals.toFixed(2)} quintals.`,
      bookingId: booking.id,
    },
  });
}

return procurement;
}

// ============================================
// COMPLETE PROCUREMENT
// ============================================

export async function completeProcurement(
  bookingId: number
) {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },

    include: {
      procurement: true,
      slot: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (!booking.procurement) {
    throw new Error(
      'Procurement record does not exist'
    );
  }

  const procurement =
    booking.procurement;

  // Quality must be completed
  if (!procurement.qualityGrade) {
    throw new Error(
      'Quality check must be completed'
    );
  }

  // Weightment must be completed
  if (!procurement.netWeightQuintals) {
    throw new Error(
      'Weightment must be completed'
    );
  }

  // Finalization must be completed
  if (
    !procurement.acceptedQuantityQuintals
  ) {
    throw new Error(
      'Finalization must be completed'
    );
  }

  // MSP must exist
  if (!procurement.mspPerQuintal) {
    throw new Error(
      'MSP must be finalized'
    );
  }

  const now = new Date();

  const result =
    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // ----------------------------------------
        // 1. Complete procurement
        // ----------------------------------------

        const updatedProcurement =
          await tx.procurementRecord.update({
            where: {
              bookingId,
            },

            data: {
              status: 'COMPLETED',
              completedAt: now,
            },
          });

        // ----------------------------------------
        // 2. Create / update payment record
        // ----------------------------------------

        await tx.paymentRecord.upsert({
          where: {
            procurementId:
              procurement.id,
          },

          create: {
            procurementId:
              procurement.id,

            amount:
              procurement.procurementAmount ??
              decimal(0),

            status: 'PROCESSING',
          },

          // IMPORTANT:
          // Do not reset an existing payment status.
          //
          // Example:
          // CREDITED must remain CREDITED.
          // FAILED must remain FAILED.
          //
          // Only update the amount here.
          update: {
            amount:
              procurement.procurementAmount ??
              decimal(0),
          },
        });

        // ----------------------------------------
        // 3. Complete booking/token
        // ----------------------------------------
     await tx.booking.update({
  where: {
    id: bookingId,
  },

  data: {
    status: 'COMPLETED',
    tokenStatus: 'COMPLETED',
  },
});

// ----------------------------------------
// 3.5. Notify farmer
// ----------------------------------------

if (procurement.status !== 'COMPLETED') {
  await tx.notification.create({
    data: {
      userId: booking.userId,
      type: NotificationType.PROCUREMENT_UPDATE,
      title: 'Procurement Completed',
      message: `Procurement for token ${booking.tokenNumber} has been completed successfully.`,
      bookingId: booking.id,
    },
  });
}
        

        // ----------------------------------------
        // 4. Update queue state
        // ----------------------------------------

        const queueState =
          await tx.queueState.findUnique({
            where: {
              centerId:
                booking.slot.centerId,
            },
          });

        // Only reset the queue if this
        // booking is the currently served token.
        if (
          queueState?.currentTokenNumber ===
          booking.tokenNumber
        ) {
          await tx.queueState.update({
            where: {
              centerId:
                booking.slot.centerId,
            },

            data: {
              currentTokenNumber:
                null,

              currentStage:
                'TOKEN_QUEUE',

              totalServedToday: {
                increment: 1,
              },

              totalProcuredToday: {
                increment: Number(
                  procurement
                    .acceptedQuantityQuintals
                ),
              },
            },
          });
        }

        return updatedProcurement;
      }
    );

  return result;
}