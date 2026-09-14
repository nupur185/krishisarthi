import prisma from '../config/prisma.js';

interface CreateBookingInput {
  userId: number;
  slotId: number;
  commodity: string;
  quantityQuintals: number;
}

export async function createBooking(input: CreateBookingInput) {
  const { userId, slotId, commodity, quantityQuintals } = input;

  if (!commodity || commodity.trim().length === 0) {
    throw new Error('Commodity is required');
  }

  if (!Number.isFinite(quantityQuintals) || quantityQuintals <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  return prisma.$transaction(async (tx) => {
    // Prevent a farmer from having multiple upcoming bookings.
    const existingBooking = await tx.booking.findFirst({
      where: {
        userId,
        status: 'CONFIRMED',
        slot: {
          startTime: {
            gte: new Date(),
          },
        },
      },
    });

    if (existingBooking) {
      throw new Error('You already have an upcoming booking');
    }

    const slot = await tx.slot.findUnique({
      where: { id: slotId },
      include: {
        center: true,
      },
    });

    if (!slot) {
      throw new Error('Slot not found');
    }

    if (slot.status !== 'AVAILABLE') {
      throw new Error('This slot is not available');
    }

    if (slot.slotDate < new Date()) {
      throw new Error('This slot has already passed');
    }

    // Prevent booking the same slot beyond its capacity.
    const updatedSlot = await tx.$queryRaw<
      Array<{
        id: number;
        bookedCount: number;
        capacity: number;
      }>
    >`
      UPDATE "Slot"
      SET
        "bookedCount" = "bookedCount" + 1,
        "status" = CASE
          WHEN "bookedCount" + 1 >= "capacity"
          THEN 'FULL'::"SlotStatus"
          ELSE 'AVAILABLE'::"SlotStatus"
        END,
        "updatedAt" = NOW()
      WHERE
        "id" = ${slotId}
        AND "status" = 'AVAILABLE'::"SlotStatus"
        AND "bookedCount" < "capacity"
      RETURNING "id", "bookedCount", "capacity"
    `;

    if (updatedSlot.length === 0) {
      throw new Error('This slot is full');
    }

    const newBookedCount = updatedSlot[0].bookedCount;

    const estimatedWaitMin = Math.ceil(
      ((newBookedCount - 1) * slot.center.avgServiceMinutes) /
        Math.max(slot.center.activeCounters, 1)
    );

    const bookingId = `BK-${slot.slotDate
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;

    const tokenNumber = `A-${String(newBookedCount).padStart(2, '0')}`;

    const booking = await tx.booking.create({
      data: {
        bookingId,
        userId,
        slotId,
        commodity: commodity.trim(),
        quantityQuintals,
        status: 'CONFIRMED',
        tokenNumber,
        tokenStatus: 'WAITING',
        estimatedWaitMin,
      },
      include: {
        slot: {
          include: {
            center: true,
          },
        },
      },
    });

    return booking;
  });
}

export async function getMyUpcomingBooking(userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      status: 'CONFIRMED',
      slot: {
        startTime: {
          gte: new Date(),
        },
      },
    },
    orderBy: {
      slot: {
        startTime: 'asc',
      },
    },
    include: {
      slot: {
        include: {
          center: true,
        },
      },
    },
  });

  if (!booking) return null;

  return booking;
}

export async function getMyBookings(userId: number) {
  return prisma.booking.findMany({
    where: {
      userId,
    },
    orderBy: {
      slot: {
        startTime: 'desc',
      },
    },
    include: {
      slot: {
        include: {
          center: true,
        },
      },
    },
  });
}

export async function cancelBooking(
  userId: number,
  bookingId: string
) {
  return prisma.$transaction(async (tx) => {
    // Find the booking and make sure it belongs to the logged-in farmer.
    const booking = await tx.booking.findFirst({
      where: {
        bookingId,
        userId,
      },
      include: {
        slot: true,
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Only confirmed bookings can be cancelled.
    if (booking.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be cancelled');
    }

    // Don't allow cancellation after the slot has started.
    if (booking.slot.startTime <= new Date()) {
      throw new Error('This booking can no longer be cancelled');
    }

    // Cancel the booking.
    const cancelledBooking = await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: 'CANCELLED',
        tokenStatus: 'CANCELLED',
      },
      include: {
        slot: {
          include: {
            center: true,
          },
        },
      },
    });

    // Release the farmer's reserved slot.
    await tx.slot.update({
      where: {
        id: booking.slotId,
      },
      data: {
        bookedCount: {
          decrement: 1,
        },
        status: 'AVAILABLE',
      },
    });

    return cancelledBooking;
  });
}

export async function rescheduleBooking(
  userId: number,
  bookingId: string,
  newSlotId: number
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        bookingId,
        userId,
      },
        include: {
          slot: true,
        },
      });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be rescheduled');
    }

    if (booking.slot.startTime <= new Date()) {
      throw new Error('This booking can no longer be rescheduled');
    }

    if (booking.slotId === newSlotId) {
      throw new Error('Please select a different slot');
    }

    const newSlot = await tx.slot.findUnique({
      where: {
        id: newSlotId,
      },
      include: {
        center: true,
      },
    });

    if (!newSlot) {
      throw new Error('New slot not found');
    }

    if (newSlot.status !== 'AVAILABLE') {
      throw new Error('New slot is not available');
    }

    if (newSlot.startTime <= new Date()) {
      throw new Error('New slot has already passed');
    }

    // Reserve a place in the new slot atomically.
    const updatedNewSlot = await tx.$queryRaw<
      Array<{
        id: number;
        bookedCount: number;
        capacity: number;
      }>
    >`
      UPDATE "Slot"
      SET
        "bookedCount" = "bookedCount" + 1,
        "status" = CASE
          WHEN "bookedCount" + 1 >= "capacity"
          THEN 'FULL'::"SlotStatus"
          ELSE 'AVAILABLE'::"SlotStatus"
        END,
        "updatedAt" = NOW()
      WHERE
        "id" = ${newSlotId}
        AND "status" = 'AVAILABLE'::"SlotStatus"
        AND "bookedCount" < "capacity"
      RETURNING "id", "bookedCount", "capacity"
    `;

    if (updatedNewSlot.length === 0) {
      throw new Error('New slot is full');
    }

    const newBookedCount = updatedNewSlot[0].bookedCount;

    const estimatedWaitMin = Math.ceil(
      ((newBookedCount - 1) * newSlot.center.avgServiceMinutes) /
        Math.max(newSlot.center.activeCounters, 1)
    );

    const tokenNumber = `A-${String(newBookedCount).padStart(2, '0')}`;

    // Release the old slot.
    await tx.slot.update({
      where: {
        id: booking.slotId,
      },
      data: {
        bookedCount: {
          decrement: 1,
        },
        status: 'AVAILABLE',
      },
    });

    // Update the booking to the new slot.
    const updatedBooking = await tx.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        slotId: newSlotId,
        tokenNumber,
        tokenStatus: 'WAITING',
        estimatedWaitMin,
      },
      include: {
        slot: {
          include: {
            center: true,
          },
        },
      },
    });

    return updatedBooking;
  });
}