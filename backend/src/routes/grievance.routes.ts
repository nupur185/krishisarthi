import { Router } from 'express';

import {
  createGrievanceController,
  getMyGrievancesController,
  getMyGrievanceController,
} from '../controllers/grievance.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Submit grievance
router.post(
  '/',
  authenticate,
  createGrievanceController
);

// Get all grievances of logged-in farmer
router.get(
  '/',
  authenticate,
  getMyGrievancesController
);

// Get one grievance
router.get(
  '/:grievanceId',
  authenticate,
  getMyGrievanceController
);

export default router;