import { Router } from 'express';

import {
  getAdminGrievancesController,
  getAdminGrievanceController,
  updateAdminGrievanceController,
} from '../controllers/grievance.controller.js';

import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requireAdmin,
  getAdminGrievancesController
);

router.get(
  '/:grievanceId',
  authenticate,
  requireAdmin,
  getAdminGrievanceController
);

router.patch(
  '/:grievanceId',
  authenticate,
  requireAdmin,
  updateAdminGrievanceController
);

export default router;