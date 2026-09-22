import { Router } from 'express';

import {
  requestOtpController,
  verifyOtpController,
  demoLoginController,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/request-otp', requestOtpController);

router.post('/verify-otp', verifyOtpController);

router.post('/demo-login', demoLoginController);

export default router;