import { Request, Response } from 'express';
import { getAvailableSlotsForCenter } from '../services/slot-service.js';

export async function getAvailableSlotsController(
  req: Request,
  res: Response
) {
  try {
    const centerId = Number(req.params.centerId);

    if (!Number.isInteger(centerId) || centerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid center ID',
      });
    }

    const slots = await getAvailableSlotsForCenter(centerId);

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error('Get slots error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch available slots',
    });
  }
}