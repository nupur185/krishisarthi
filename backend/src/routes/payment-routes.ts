import { Router } from 'express';
import {
  getPayments,
  getPayment,
  initiatePaymentController,
  creditPaymentController,
  failPaymentController,
} from '../controllers/payment-controller.js';
import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware.js';

const router = Router();

// Admin/operator: view all payment records
router.get(
  '/',
  authenticate,
  requireAdmin,
  getPayments
);

// Admin/operator: view one payment
router.get(
  '/:paymentId',
  authenticate,
  requireAdmin,
  getPayment
);

// Admin/operator: PROCESSING → INITIATED
router.patch(
  '/:paymentId/initiate',
  authenticate,
  requireAdmin,
  initiatePaymentController
);

// Admin/operator: INITIATED → CREDITED
router.patch(
  '/:paymentId/credit',
  authenticate,
  requireAdmin,
  creditPaymentController
);

// Admin/operator: PROCESSING/INITIATED → FAILED
router.patch(
  '/:paymentId/fail',
  authenticate,
  requireAdmin,
  failPaymentController
);

export default router;