import { Router } from 'express';

import {
  createBookingController,
  getMyUpcomingBookingController,
  getMyBookingsController,
  getMyTokenController,
   cancelBookingController,
   rescheduleBookingController,
} from '../controllers/booking.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  createBookingController
);

router.get(
  '/my-upcoming',
  authenticate,
  getMyUpcomingBookingController
);

router.get(
  '/my-token',
  authenticate,
  getMyTokenController
);

router.get(
  '/my',
  authenticate,
  getMyBookingsController
);

router.patch(
  '/:bookingId/cancel',
  authenticate,
  cancelBookingController
);

router.patch(
  '/:bookingId/reschedule',
  authenticate,
  rescheduleBookingController
);

export default router;