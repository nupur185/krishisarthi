import { Request, Response } from 'express';
import {
  getActiveCenters,
  getCenterById,
} from '../services/center.service.js';

export async function getActiveCentersController(
  _req: Request,
  res: Response
) {
  try {
    const centers = await getActiveCenters();

    return res.status(200).json({
      success: true,
      data: centers,
    });
  } catch (error) {
    console.error('Get centers error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch procurement centers',
    });
  }
}

export async function getCenterByIdController(
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

    const center = await getCenterById(centerId);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Procurement center not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: center,
    });
  } catch (error) {
    console.error('Get center error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch procurement center',
    });
  }
}