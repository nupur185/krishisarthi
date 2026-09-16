import { Router } from 'express';

import {
  getProcurement,
  getMyProcurementStatus,
  saveQuality,
  saveWeight,
  finalize,
  complete,
} from '../controllers/procurement-controller';

import {
  authenticate,
  requireAdmin,
} from '../middleware/auth.middleware';

const router = Router();

// ============================================
// GET MY PROCUREMENT + PAYMENT STATUS
// ============================================
// Farmer can view their own procurement
// and payment status.

router.get(
  '/my',
  authenticate,
  getMyProcurementStatus
);

// ============================================
// GET PROCUREMENT
// ============================================
// Farmer + Operator/Admin can view procurement.

router.get(
  '/booking/:bookingId',
  authenticate,
  getProcurement
);

// ============================================
// QUALITY CHECK
// ============================================
// Operator/Admin only.

router.post(
  '/booking/:bookingId/quality',
  authenticate,
  requireAdmin,
  saveQuality
);

// ============================================
// WEIGHTMENT
// ============================================
// Operator/Admin only.

router.post(
  '/booking/:bookingId/weight',
  authenticate,
  requireAdmin,
  saveWeight
);

// ============================================
// FINALIZATION
// ============================================
// Operator/Admin only.

router.post(
  '/booking/:bookingId/finalize',
  authenticate,
  requireAdmin,
  finalize
);

// ============================================
// COMPLETE PROCUREMENT
// ============================================
// Operator/Admin only.

router.post(
  '/booking/:bookingId/complete',
  authenticate,
  requireAdmin,
  complete
);

export default router;