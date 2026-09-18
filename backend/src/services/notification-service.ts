import prisma from '../config/prisma.js';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: number;
  paymentId?: number;
}

// ============================================
// CREATE NOTIFICATION
// ============================================

export async function createNotification(
  input: CreateNotificationInput
) {
  const {
    userId,
    type,
    title,
    message,
    bookingId,
    paymentId,
  } = input;

  if (!title || title.trim().length === 0) {
    throw new Error('Notification title is required');
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Notification message is required');
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title: title.trim(),
      message: message.trim(),
      bookingId,
      paymentId,
    },
  });
}

// ============================================
// GET MY NOTIFICATIONS
// ============================================

export async function getMyNotifications(userId: number) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingId: true,
          tokenNumber: true,
          commodity: true,
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          bankReference: true,
        },
      },
    },
  });
}

// ============================================
// GET UNREAD COUNT
// ============================================

export async function getUnreadNotificationCount(userId: number) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

// ============================================
// MARK ONE NOTIFICATION AS READ
// ============================================

export async function markNotificationAsRead(
  userId: number,
  notificationId: number
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  if (notification.isRead) {
    return notification;
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
}

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================

export async function markAllNotificationsAsRead(userId: number) {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return result.count;
}