import { Router } from 'express';

import {
  getMyQueue,
  getOperatorQueue,
  callNext,
  changeStage,
  completeToken,
} from '../controllers/queue-controller.js';

import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

// Farmer
router.get('/my', authenticate, getMyQueue);

// Operator / Admin
router.get(
  '/center/:centerId',
  authenticate,
  requireAdmin,
  getOperatorQueue
);

router.post(
  '/center/:centerId/call-next',
  authenticate,
  requireAdmin,
  callNext
);

router.patch(
  '/center/:centerId/stage',
  authenticate,
  requireAdmin,
  changeStage
);

router.post(
  '/center/:centerId/complete',
  authenticate,
  requireAdmin,
  completeToken
);

export default router;