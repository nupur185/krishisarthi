import { Router } from 'express';

import {
  getMyNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from '../controllers/notification-controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Get all notifications for logged-in farmer
router.get(
  '/',
  authenticate,
  getMyNotificationsController
);

// Get unread notification count
router.get(
  '/unread-count',
  authenticate,
  getUnreadNotificationCountController
);

// Mark all notifications as read
router.patch(
  '/read-all',
  authenticate,
  markAllNotificationsAsReadController
);

// Mark one notification as read
router.patch(
  '/:notificationId/read',
  authenticate,
  markNotificationAsReadController
);

export default router;