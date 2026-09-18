import { Response } from 'express';
import {
  createGrievance,
  getMyGrievances,
  getMyGrievance,
  getAllGrievances,
  getAdminGrievance,
  updateGrievanceStatus,
} from '../services/grievance.service.js';
import { GrievanceIssueType, GrievanceStatus,  } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

/**
 * Submit a new grievance.
 */
export async function createGrievanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    const {
      issueType,
      description,
      bookingId,
      photoUrl,
    } = req.body;

    // Validate issue type.
    if (
      !issueType ||
      !Object.values(GrievanceIssueType).includes(issueType)
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid grievance issue type is required.',
      });
    }

    // Validate description.
    if (
      typeof description !== 'string' ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Grievance description is required.',
      });
    }

    let parsedBookingId: number | undefined;

    if (bookingId !== undefined && bookingId !== null) {
      parsedBookingId = Number(bookingId);

      if (
        !Number.isInteger(parsedBookingId) ||
        parsedBookingId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid booking ID.',
        });
      }
    }

    const grievance = await createGrievance(userId, {
      issueType,
      description,
      bookingId: parsedBookingId,
      photoUrl:
        typeof photoUrl === 'string' && photoUrl.trim()
          ? photoUrl.trim()
          : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully.',
      grievance,
    });
  } catch (error) {
    console.error('Create grievance error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to submit grievance.';

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

/**
 * Get all grievances submitted by the logged-in farmer.
 */
export async function getMyGrievancesController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    const grievances = await getMyGrievances(userId);

    return res.status(200).json({
      success: true,
      grievances,
    });
  } catch (error) {
    console.error('Get grievances error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch grievances.',
    });
  }
}

/**
 * Get one grievance belonging to the logged-in farmer.
 */
export async function getMyGrievanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.',
      });
    }

    const grievanceIdParam = req.params.grievanceId;

    if (typeof grievanceIdParam !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid grievance ID.',
      });
    }

    const grievanceId = grievanceIdParam.trim();

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Grievance ID is required.',
      });
    }

    const grievance = await getMyGrievance(
      userId,
      grievanceId
    );

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found.',
      });
    }

    return res.status(200).json({
      success: true,
      grievance,
    });
  } catch (error) {
    console.error('Get grievance error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch grievance.',
    });
  }
}

export async function getAdminGrievancesController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const grievances = await getAllGrievances();

    return res.status(200).json({
      success: true,
      grievances,
    });
  } catch (error) {
    console.error(
      'Get admin grievances error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch grievances.',
    });
  }
}

export async function getAdminGrievanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const grievanceIdParam =
      req.params.grievanceId;

    if (typeof grievanceIdParam !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid grievance ID.',
      });
    }

    const grievanceId =
      grievanceIdParam.trim();

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Grievance ID is required.',
      });
    }

    const grievance =
      await getAdminGrievance(grievanceId);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found.',
      });
    }

    return res.status(200).json({
      success: true,
      grievance,
    });
  } catch (error) {
    console.error(
      'Get admin grievance error:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch grievance.',
    });
  }
}

export async function updateAdminGrievanceController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const grievanceIdParam =
      req.params.grievanceId;

    if (typeof grievanceIdParam !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid grievance ID.',
      });
    }

    const grievanceId =
      grievanceIdParam.trim();

    if (!grievanceId) {
      return res.status(400).json({
        success: false,
        message: 'Grievance ID is required.',
      });
    }

    const { status, resolutionNote } =
      req.body;

    if (
      !status ||
      !Object.values(GrievanceStatus).includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid grievance status is required.',
      });
    }

    if (
      resolutionNote !== undefined &&
      resolutionNote !== null &&
      typeof resolutionNote !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Resolution note must be text.',
      });
    }

    const grievance =
      await updateGrievanceStatus(
        grievanceId,
        {
          status,
          resolutionNote,
        }
      );

    return res.status(200).json({
      success: true,
      message: 'Grievance updated successfully.',
      grievance,
    });
  } catch (error) {
    console.error(
      'Update admin grievance error:',
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update grievance.';

    return res.status(400).json({
      success: false,
      message,
    });
  }
}