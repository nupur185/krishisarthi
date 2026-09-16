import { Response } from 'express';

import {
  AuthenticatedRequest,
} from '../middleware/auth.middleware';

import {
  getProcurementByBookingId,
  getMyProcurement,
  updateQuality,
  updateWeight,
  finalizeProcurement,
  completeProcurement,
} from '../services/procurement-service';

// ============================================
// GET PROCUREMENT
// ============================================

export async function getProcurement(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = Number(
      req.params.bookingId
    );

    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const result =
      await getProcurementByBookingId(
        bookingId
      );

    // ----------------------------------------
    // Farmer ownership check
    // ----------------------------------------

    if (
      req.user?.role === 'FARMER' &&
      result.farmer.farmerId !==
        req.user.farmerId
    ) {
      return res.status(403).json({
        success: false,
        message:
          'You are not allowed to view this procurement record',
      });
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      'Get procurement error:',
      error
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to get procurement',
    });
  }
}

// ============================================
// GET MY PROCUREMENT + PAYMENT STATUS
// ============================================

export async function getMyProcurementStatus(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const result =
      await getMyProcurement(
        req.user.userId
      );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      'Get my procurement error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to get procurement status',
    });
  }
}

// ============================================
// SAVE QUALITY
// ============================================

export async function saveQuality(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = Number(
      req.params.bookingId
    );

    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const {
      moisturePercent,
      foreignMatterPercent,
      damagedGrainsPercent,
      qualityGrade,
    } = req.body;

    if (
      moisturePercent === undefined ||
      foreignMatterPercent === undefined ||
      damagedGrainsPercent === undefined ||
      !qualityGrade
    ) {
      return res.status(400).json({
        success: false,
        message:
          'All quality fields are required',
      });
    }

    const result =
      await updateQuality(
        bookingId,
        {
          moisturePercent:
            Number(moisturePercent),

          foreignMatterPercent:
            Number(foreignMatterPercent),

          damagedGrainsPercent:
            Number(damagedGrainsPercent),

          qualityGrade,
        }
      );

    return res.json({
      success: true,
      message:
        'Quality data saved successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Save quality error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to save quality data',
    });
  }
}

// ============================================
// SAVE WEIGHT
// ============================================

export async function saveWeight(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = Number(
      req.params.bookingId
    );

    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const {
      grossWeightQuintals,
      tareWeightQuintals,
    } = req.body;

    if (
      grossWeightQuintals === undefined ||
      tareWeightQuintals === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Gross weight and tare weight are required',
      });
    }

    const result =
      await updateWeight(
        bookingId,
        {
          grossWeightQuintals:
            Number(
              grossWeightQuintals
            ),

          tareWeightQuintals:
            Number(
              tareWeightQuintals
            ),
        }
      );

    return res.json({
      success: true,
      message:
        'Weight data saved successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Save weight error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to save weight data',
    });
  }
}

// ============================================
// FINALIZE PROCUREMENT
// ============================================

export async function finalize(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = Number(
      req.params.bookingId
    );

    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const {
      acceptedQuantityQuintals,
      mspPerQuintal,
    } = req.body;

    if (
      acceptedQuantityQuintals === undefined ||
      mspPerQuintal === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Accepted quantity and MSP are required',
      });
    }

    const result =
      await finalizeProcurement(
        bookingId,
        {
          acceptedQuantityQuintals:
            Number(
              acceptedQuantityQuintals
            ),

          mspPerQuintal:
            Number(
              mspPerQuintal
            ),
        }
      );

    return res.json({
      success: true,
      message:
        'Procurement finalized successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Finalize procurement error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to finalize procurement',
    });
  }
}

// ============================================
// COMPLETE PROCUREMENT
// ============================================

export async function complete(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const bookingId = Number(
      req.params.bookingId
    );

    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const result =
      await completeProcurement(
        bookingId
      );

    return res.json({
      success: true,
      message:
        'Procurement completed successfully',
      data: result,
    });
  } catch (error) {
    console.error(
      'Complete procurement error:',
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to complete procurement',
    });
  }
}