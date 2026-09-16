import prisma from '../config/prisma.js';

interface QueueStatus {
  tokenNumber: string;
  nowServing: string | null;
  farmersAhead: number;
  queueLength: number;
  activeCounters: number;
  avgServiceMinutes: number;
  estimatedWaitMin: number;
  currentStage: string;
  centerName: string;

  slotDate: Date;
  startTime: Date;
  endTime: Date;

  updatedAt: Date;
}

interface OperatorQueueBooking {
    id: number;
  bookingId: string;
  tokenNumber: string;
  tokenStatus: string;
  status: string;
  commodity: string;
  quantityQuintals: number;
  slotId: number;
  slotDate: Date;
  startTime: Date;
  endTime: Date;
  farmerName: string;
  farmerId: string;
}

function extractTokenNumber(token: string | null): number {
  if (!token) {
    return Number.MAX_SAFE_INTEGER;
  }

  const match = token.match(/(\d+)$/);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Number(match[1]);
}

/*
 * ---------------------------------------------------------
 * FARMER QUEUE STATUS
 * ---------------------------------------------------------
 */

export async function getMyQueueStatus(
  userId: number
): Promise<QueueStatus | null> {
  const booking = await prisma.booking.findFirst({
    where: {
      userId,
      status: 'CONFIRMED',
    },
    include: {
      slot: {
        include: {
          center: true,
        },
      },
    },
  });

  if (!booking) {
    return null;
  }

  const centerId = booking.slot.center.id;

  let queueState = await prisma.queueState.findUnique({
    where: {
      centerId,
    },
  });

  if (!queueState) {
    queueState = await prisma.queueState.create({
      data: {
        centerId,
        currentTokenNumber: null,
        currentStage: 'TOKEN_QUEUE',
        activeCounters:
          booking.slot.center.activeCounters,
      },
    });
  }

  const queueBookings = await prisma.booking.findMany({
    where: {
      slotId: booking.slotId,
      status: 'CONFIRMED',
      tokenStatus: {
        in: ['WAITING', 'READY', 'SERVING'],
      },
      tokenNumber: {
        not: null,
      },
    },
    select: {
      tokenNumber: true,
      tokenStatus: true,
    },
  });

  const sortedBookings = queueBookings.sort(
    (a, b) =>
      extractTokenNumber(a.tokenNumber) -
      extractTokenNumber(b.tokenNumber)
  );

  const queueLength = sortedBookings.length;

  /*
   * IMPORTANT:
   * We no longer automatically make the first token
   * "Now Serving".
   *
   * The operator must actually call the token.
   */
  const nowServing =
    queueState.currentTokenNumber;

  let farmersAhead = 0;

  const myTokenPosition = extractTokenNumber(
    booking.tokenNumber
  );

  if (nowServing) {
    const currentTokenPosition =
      extractTokenNumber(nowServing);

    if (myTokenPosition > currentTokenPosition) {
      farmersAhead = sortedBookings.filter(
        (item) => {
          const tokenPosition =
            extractTokenNumber(item.tokenNumber);

          return (
            tokenPosition > currentTokenPosition &&
            tokenPosition < myTokenPosition
          );
        }
      ).length;
    }
  } else {
    /*
     * If nobody is currently being served,
     * count all tokens before the farmer.
     */
    farmersAhead = sortedBookings.filter(
      (item) =>
        extractTokenNumber(item.tokenNumber) <
        myTokenPosition
    ).length;
  }

  const avgServiceMinutes =
    booking.slot.center.avgServiceMinutes;

  const activeCounters =
    queueState.activeCounters ||
    booking.slot.center.activeCounters ||
    1;

  const estimatedWaitMin = Math.max(
    0,
    Math.ceil(
      (farmersAhead * avgServiceMinutes) /
        activeCounters
    )
  );

  return {
    tokenNumber: booking.tokenNumber ?? '—',
    nowServing,
    farmersAhead,
    queueLength,
    activeCounters,
    avgServiceMinutes,
    estimatedWaitMin,
    currentStage: queueState.currentStage,
    centerName: booking.slot.center.name,

    slotDate: booking.slot.slotDate,
    startTime: booking.slot.startTime,
    endTime: booking.slot.endTime,

    updatedAt: queueState.updatedAt,
  };
}

/*
 * ---------------------------------------------------------
 * OPERATOR: VIEW QUEUE
 * ---------------------------------------------------------
 */

export async function getCenterQueue(
  centerId: number,
  slotId?: number
) {
  const center = await prisma.procurementCenter.findUnique(
    {
      where: {
        id: centerId,
      },
      include: {
        queueState: true,
      },
    }
  );

  if (!center) {
    throw new Error('Procurement center not found');
  }

  const whereClause: any = {
    status: 'CONFIRMED',
    tokenNumber: {
      not: null,
    },
    tokenStatus: {
      in: ['WAITING', 'READY', 'SERVING'],
    },
    slot: {
      centerId,
    },
  };

  if (slotId) {
    whereClause.slotId = slotId;
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      user: true,
      slot: true,
    },
  });

  const sortedBookings = bookings.sort(
    (a, b) =>
      extractTokenNumber(a.tokenNumber) -
      extractTokenNumber(b.tokenNumber)
  );

  const queue: OperatorQueueBooking[] =
    sortedBookings.map((booking) => ({
        id: booking.id,
      bookingId: booking.bookingId,
      tokenNumber: booking.tokenNumber ?? '—',
      tokenStatus: booking.tokenStatus,
      status: booking.status,
      commodity: booking.commodity,
      quantityQuintals: booking.quantityQuintals.toNumber(),
      slotId: booking.slotId,
      slotDate: booking.slot.slotDate,
      startTime: booking.slot.startTime,
      endTime: booking.slot.endTime,
      farmerName: booking.user.fullName,
      farmerId: booking.user.farmerId,
    }));

  return {
    center: {
      id: center.id,
      name: center.name,
      address: center.address,
      village: center.village,
      district: center.district,
      state: center.state,
      activeCounters:
        center.queueState?.activeCounters ??
        center.activeCounters,
      avgServiceMinutes:
        center.avgServiceMinutes,
    },

    queueState: {
      currentTokenNumber:
        center.queueState?.currentTokenNumber ??
        null,
      currentStage:
        center.queueState?.currentStage ??
        'TOKEN_QUEUE',
      totalServedToday:
        center.queueState?.totalServedToday ??
        0,
      totalProcuredToday:
        center.queueState?.totalProcuredToday ??
        0,
      updatedAt:
        center.queueState?.updatedAt ??
        new Date(),
    },

    queue,
  };
}

/*
 * ---------------------------------------------------------
 * OPERATOR: CALL NEXT TOKEN
 * ---------------------------------------------------------
 */

export async function callNextToken(
  centerId: number,
  slotId: number
) {
  const center = await prisma.procurementCenter.findUnique(
    {
      where: {
        id: centerId,
      },
    }
  );

  if (!center) {
    throw new Error('Procurement center not found');
  }

  let queueState =
    await prisma.queueState.findUnique({
      where: {
        centerId,
      },
    });

  if (!queueState) {
    queueState =
      await prisma.queueState.create({
        data: {
          centerId,
          currentTokenNumber: null,
          currentStage: 'TOKEN_QUEUE',
          activeCounters:
            center.activeCounters,
        },
      });
  }

  /*
   * Don't call another farmer while the current farmer
   * is still being served.
   */
  if (queueState.currentTokenNumber) {
    const currentBooking =
      await prisma.booking.findFirst({
        where: {
          slotId,
          tokenNumber:
            queueState.currentTokenNumber,
          status: 'CONFIRMED',
          tokenStatus: 'SERVING',
        },
      });

    if (currentBooking) {
      throw new Error(
        `Token ${queueState.currentTokenNumber} is still being served`
      );
    }
  }

  const nextBooking =
    await prisma.booking.findFirst({
      where: {
        slotId,
        status: 'CONFIRMED',
        tokenStatus: 'WAITING',
        tokenNumber: {
          not: null,
        },
      },
      orderBy: {
        id: 'asc',
      },
      include: {
        user: true,
      },
    });

  if (!nextBooking) {
    return null;
  }

  /*
   * Mark the selected farmer as SERVING.
   */
  await prisma.booking.update({
    where: {
      id: nextBooking.id,
    },
    data: {
      tokenStatus: 'SERVING',
    },
  });

  /*
   * Update center queue state.
   */
  const updatedQueueState =
    await prisma.queueState.update({
      where: {
        centerId,
      },
      data: {
        currentTokenNumber:
          nextBooking.tokenNumber,
        currentStage: 'TOKEN_QUEUE',
      },
    });

  return {
    bookingId: nextBooking.bookingId,
    tokenNumber:
      nextBooking.tokenNumber,
    farmerName: nextBooking.user.fullName,
    farmerId: nextBooking.user.farmerId,
    currentStage:
      updatedQueueState.currentStage,
    updatedAt:
      updatedQueueState.updatedAt,
  };
}

/*
 * ---------------------------------------------------------
 * OPERATOR: CHANGE PROCUREMENT STAGE
 * ---------------------------------------------------------
 */

export async function updateQueueStage(
  centerId: number,
  stage:
    | 'TOKEN_QUEUE'
    | 'QUALITY_CHECK'
    | 'WEIGHTMENT'
    | 'FINALIZATION'
    | 'COMPLETED'
) {
  const queueState =
    await prisma.queueState.findUnique({
      where: {
        centerId,
      },
    });

  if (!queueState) {
    throw new Error(
      'Queue state not found for this center'
    );
  }

  if (
    stage !== 'TOKEN_QUEUE' &&
    !queueState.currentTokenNumber
  ) {
    throw new Error(
      'No farmer is currently being served'
    );
  }

  const updatedQueueState =
    await prisma.queueState.update({
      where: {
        centerId,
      },
      data: {
        currentStage: stage,
      },
    });

  return updatedQueueState;
}

/*
 * ---------------------------------------------------------
 * OPERATOR: COMPLETE CURRENT FARMER
 * ---------------------------------------------------------
 */

export async function completeCurrentToken(
  centerId: number
) {
  const queueState =
    await prisma.queueState.findUnique({
      where: {
        centerId,
      },
    });

  if (!queueState?.currentTokenNumber) {
    throw new Error(
      'No farmer is currently being served'
    );
  }

  const currentBooking =
    await prisma.booking.findFirst({
      where: {
        tokenNumber:
          queueState.currentTokenNumber,
        status: 'CONFIRMED',
        tokenStatus: 'SERVING',
      },
    });

  if (!currentBooking) {
    throw new Error(
      'Current token booking not found'
    );
  }

  /*
   * Mark farmer's token as completed.
   */
  await prisma.booking.update({
    where: {
      id: currentBooking.id,
    },
    data: {
      tokenStatus: 'COMPLETED',
    },
  });

  /*
   * Clear the current token.
   *
   * The operator will use "Call Next" to select
   * the next farmer.
   */
  const updatedQueueState =
    await prisma.queueState.update({
      where: {
        centerId,
      },
      data: {
        currentTokenNumber: null,
        currentStage: 'TOKEN_QUEUE',
        totalServedToday: {
          increment: 1,
        },
      },
    });

  return {
    completedToken:
      currentBooking.tokenNumber,
    bookingId:
      currentBooking.bookingId,
    totalServedToday:
      updatedQueueState.totalServedToday,
    updatedAt:
      updatedQueueState.updatedAt,
  };
}