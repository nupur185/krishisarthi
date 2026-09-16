import { Request, Response } from 'express';

import {
  getMyQueueStatus,
  getCenterQueue,
  callNextToken,
  updateQueueStage,
  completeCurrentToken,
} from '../services/queue-service.js';

interface AuthenticatedRequest
  extends Request {
  user?: {
    userId: number;
    farmerId?: string;
    role?: string;
  };
}

/*
 * ---------------------------------------------------------
 * FARMER
 * GET /api/queue/my
 * ---------------------------------------------------------
 */

export async function getMyQueue(
  req: Request,
  res: Response
) {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const userId =
      authenticatedRequest.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const queue =
      await getMyQueueStatus(userId);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message:
          'No upcoming booking found',
      });
    }

    return res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error(
      'Get queue error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to fetch queue status',
    });
  }
}

/*
 * ---------------------------------------------------------
 * OPERATOR
 * GET /api/queue/center/:centerId
 * ---------------------------------------------------------
 */

export async function getOperatorQueue(
  req: Request,
  res: Response
) {
  try {
    const centerId = Number(
      req.params.centerId
    );

    const slotId = req.query.slotId
      ? Number(req.query.slotId)
      : undefined;

    if (!centerId || Number.isNaN(centerId)) {
      return res.status(400).json({
        success: false,
        message:
          'Valid center ID is required',
      });
    }

    const queue =
      await getCenterQueue(
        centerId,
        slotId
      );

    return res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    console.error(
      'Get operator queue error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to fetch operator queue',
    });
  }
}

/*
 * ---------------------------------------------------------
 * OPERATOR
 * POST /api/queue/center/:centerId/call-next
 * ---------------------------------------------------------
 */

export async function callNext(
  req: Request,
  res: Response
) {
  try {
    const centerId = Number(
      req.params.centerId
    );

    const slotId = Number(
      req.body?.slotId
    );

    if (
      !centerId ||
      Number.isNaN(centerId) ||
      !slotId ||
      Number.isNaN(slotId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid center ID and slot ID are required',
      });
    }

    const result =
      await callNextToken(
        centerId,
        slotId
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message:
          'No waiting farmers found in this slot',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        `Token ${result.tokenNumber} is now being served`,
      data: result,
    });
  } catch (error) {
    console.error(
      'Call next token error:',
      error
    );

    return res.status(409).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to call next token',
    });
  }
}

/*
 * ---------------------------------------------------------
 * OPERATOR
 * PATCH /api/queue/center/:centerId/stage
 * ---------------------------------------------------------
 */

export async function changeStage(
  req: Request,
  res: Response
) {
  try {
    const centerId = Number(
      req.params.centerId
    );

    const stage = req.body?.stage;

    const validStages = [
      'TOKEN_QUEUE',
      'QUALITY_CHECK',
      'WEIGHTMENT',
      'FINALIZATION',
      'COMPLETED',
    ];

    if (
      !centerId ||
      Number.isNaN(centerId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid center ID is required',
      });
    }

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid procurement stage',
      });
    }

    const queue =
      await updateQueueStage(
        centerId,
        stage
      );

    return res.status(200).json({
      success: true,
      message:
        'Procurement stage updated',
      data: queue,
    });
  } catch (error) {
    console.error(
      'Change queue stage error:',
      error
    );

    return res.status(409).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to update procurement stage',
    });
  }
}

/*
 * ---------------------------------------------------------
 * OPERATOR
 * POST /api/queue/center/:centerId/complete
 * ---------------------------------------------------------
 */

export async function completeToken(
  req: Request,
  res: Response
) {
  try {
    const centerId = Number(
      req.params.centerId
    );

    if (
      !centerId ||
      Number.isNaN(centerId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Valid center ID is required',
      });
    }

    const result =
      await completeCurrentToken(
        centerId
      );

    return res.status(200).json({
      success: true,
      message:
        `Token ${result.completedToken} completed successfully`,
      data: result,
    });
  } catch (error) {
    console.error(
      'Complete token error:',
      error
    );

    return res.status(409).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to complete current token',
    });
  }
}