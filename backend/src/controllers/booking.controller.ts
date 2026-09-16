import { Response } from 'express';
import {
  createBooking,
  getMyUpcomingBooking,
  getMyBookings,
  getMyToken,
  cancelBooking,
  rescheduleBooking,
} from '../services/booking.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function createBookingController(
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

    const { slotId, commodity, quantityQuintals } = req.body;

    const parsedSlotId = Number(slotId);
    const parsedQuantity = Number(quantityQuintals);

    if (!Number.isInteger(parsedSlotId) || parsedSlotId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID',
      });
    }

    if (!commodity || typeof commodity !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Commodity is required',
      });
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    const booking = await createBooking({
      userId: req.user.userId,
      slotId: parsedSlotId,
      commodity,
      quantityQuintals: parsedQuantity,
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to create booking';

    if (
      message === 'Slot not found' ||
      message === 'This slot is not available' ||
      message === 'This slot has already passed' ||
      message === 'This slot is full' ||
      message === 'You already have an upcoming booking'
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    });
  }
}

export async function getMyUpcomingBookingController(
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

    const booking = await getMyUpcomingBooking(req.user.userId);

    if (!booking) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No upcoming booking found',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get upcoming booking error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming booking',
    });
  }
}
export async function getMyTokenController(
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

    const booking = await getMyToken(req.user.userId);

    if (!booking) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active token found',
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get my token error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch token',
    });
  }
}


export async function getMyBookingsController(
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

    const bookings = await getMyBookings(req.user.userId);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
}

export async function cancelBookingController(
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

    const bookingId = req.params.bookingId;

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    const booking = await cancelBooking(
      req.user.userId,
      bookingId
    );

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to cancel booking';

    if (
      message === 'Booking not found' ||
      message === 'Only confirmed bookings can be cancelled' ||
      message === 'This booking can no longer be cancelled'
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
    });
  }
}

export async function rescheduleBookingController(
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

    const bookingId = req.params.bookingId;
    const newSlotId = Number(req.body.newSlotId);

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    if (!Number.isInteger(newSlotId) || newSlotId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid new slot ID',
      });
    }

    const booking = await rescheduleBooking(
      req.user.userId,
      bookingId,
      newSlotId
    );

    return res.status(200).json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to reschedule booking';

    const clientErrors = [
      'Booking not found',
      'Only confirmed bookings can be rescheduled',
      'This booking can no longer be rescheduled',
      'Please select a different slot',
      'New slot not found',
      'New slot is not available',
      'New slot has already passed',
      'New slot is full',
    ];

    if (clientErrors.includes(message)) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to reschedule booking',
    });
  }
}