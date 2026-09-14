import { Router } from 'express';
import {
  registerFarmerController,
  getMyProfile,
} from '../controllers/farmer.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public route
router.post('/register', registerFarmerController);

// Protected route
router.get('/me', authenticate, getMyProfile);

export default router;