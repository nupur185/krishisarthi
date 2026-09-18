import { Response } from 'express';

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notification-service.js';

import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

// ============================================
// GET MY NOTIFICATIONS
// ============================================

export async function getMyNotificationsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const notifications = await getMyNotifications(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
}

// ============================================
// GET UNREAD COUNT
// ============================================

export async function getUnreadNotificationCountController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const count = await getUnreadNotificationCount(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    console.error('Get unread notification count error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notification count',
    });
  }
}

// ============================================
// MARK ONE AS READ
// ============================================

export async function markNotificationAsReadController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const notificationId = Number(req.params.notificationId);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    const notification = await markNotificationAsRead(
      req.user.userId,
      notificationId
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to mark notification as read';

    if (message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
}

// ============================================
// MARK ALL AS READ
// ============================================

export async function markAllNotificationsAsReadController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const count = await markAllNotificationsAsRead(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        updatedCount: count,
      },
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
}