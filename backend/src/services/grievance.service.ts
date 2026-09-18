import prisma from '../config/prisma.js';
import { GrievanceIssueType, GrievanceStatus,} from '@prisma/client';

/**
 * Generate a unique grievance reference.
 * Example: GR-20260917-482731
 */
function generateGrievanceId(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const randomNumber = Math.floor(100000 + Math.random() * 900000);

  return `GR-${year}${month}${day}-${randomNumber}`;
}

/**
 * Create a new grievance.
 */
export async function createGrievance(
  userId: number,
  data: {
    issueType: GrievanceIssueType;
    description: string;
    bookingId?: number;
    photoUrl?: string;
  }
) {
  const description = data.description.trim();

  if (!description) {
    throw new Error('Grievance description is required.');
  }

  if (description.length < 10) {
    throw new Error(
      'Grievance description must contain at least 10 characters.'
    );
  }

  // If a booking is provided, verify that it belongs to the farmer.
  if (data.bookingId !== undefined) {
    const booking = await prisma.booking.findFirst({
      where: {
        id: data.bookingId,
        userId,
      },
    });

    if (!booking) {
      throw new Error(
        'The selected booking was not found for this farmer.'
      );
    }
  }

  // Generate a grievance ID and make sure it is unique.
  let grievanceId = generateGrievanceId();

  while (
    await prisma.grievance.findUnique({
      where: { grievanceId },
    })
  ) {
    grievanceId = generateGrievanceId();
  }

  const grievance = await prisma.grievance.create({
    data: {
      grievanceId,
      userId,
      bookingId: data.bookingId,
      issueType: data.issueType,
      description,
      photoUrl: data.photoUrl,
      status: 'OPEN',
    },
    include: {
      booking: {
        include: {
          slot: {
            include: {
              center: true,
            },
          },
        },
      },
    },
  });

  return grievance;
}

/**
 * Get all grievances submitted by a farmer.
 */
export async function getMyGrievances(userId: number) {
  return prisma.grievance.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      booking: {
        include: {
          slot: {
            include: {
              center: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get one grievance belonging to the logged-in farmer.
 */
export async function getMyGrievance(
  userId: number,
  grievanceId: string
) {
  return prisma.grievance.findFirst({
    where: {
      grievanceId,
      userId,
    },
    include: {
      booking: {
        include: {
          slot: {
            include: {
              center: true,
            },
          },
        },
      },
    },
  });
}

export async function getAllGrievances() {
  return prisma.grievance.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          farmerId: true,
          fullName: true,
          mobile: true,
          district: true,
          state: true,
        },
      },
      booking: {
        include: {
          slot: {
            include: {
              center: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminGrievance(
  grievanceId: string
) {
  return prisma.grievance.findUnique({
    where: {
      grievanceId,
    },
    include: {
      user: {
        select: {
          id: true,
          farmerId: true,
          fullName: true,
          mobile: true,
          district: true,
          state: true,
        },
      },
      booking: {
        include: {
          slot: {
            include: {
              center: true,
            },
          },
        },
      },
    },
  });
}

export async function updateGrievanceStatus(
  grievanceId: string,
  data: {
    status: GrievanceStatus;
    resolutionNote?: string;
  }
) {
  const existingGrievance =
    await prisma.grievance.findUnique({
      where: {
        grievanceId,
      },
    });

  if (!existingGrievance) {
    throw new Error('Grievance not found.');
  }

  const resolutionNote =
    data.resolutionNote?.trim() || null;

  if (
    (data.status === 'RESOLVED' ||
      data.status === 'REJECTED') &&
    !resolutionNote
  ) {
    throw new Error(
      'A resolution note is required when resolving or rejecting a grievance.'
    );
  }

  const resolvedAt =
    data.status === 'RESOLVED'
      ? existingGrievance.resolvedAt ??
        new Date()
      : null;

  return prisma.grievance.update({
    where: {
      grievanceId,
    },
    data: {
      status: data.status,
      resolutionNote,
      resolvedAt,
    },
    include: {
      user: {
        select: {
          id: true,
          farmerId: true,
          fullName: true,
          mobile: true,
          district: true,
          state: true,
        },
      },
      booking: {
        include: {
          slot: {
            include: {
              center: true,
            },
          },
        },
      },
    },
  });
}