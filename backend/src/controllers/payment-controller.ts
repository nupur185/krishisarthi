import { Request, Response } from 'express';
import {
  getAllPayments,
  getPaymentById,
  initiatePayment,
  creditPayment,
  failPayment,
} from '../services/payment-service.js';

function parsePaymentId(value: string): number | null {
  const paymentId = Number(value);

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return null;
  }

  return paymentId;
}

export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await getAllPayments();

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Get payments error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment records',
    });
  }
}

export async function getPayment(req: Request, res: Response) {
  try {
    const paymentId = parsePaymentId(req.params.paymentId as string);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID',
      });
    }

    const payment = await getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get payment error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment record',
    });
  }
}

export async function initiatePaymentController(
  req: Request,
  res: Response
) {
  try {
    const paymentId = parsePaymentId(req.params.paymentId as string);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID',
      });
    }

    const payment = await initiatePayment(paymentId);

    return res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Initiate payment error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to initiate payment';

    if (message === 'Payment record not found') {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function creditPaymentController(
  req: Request,
  res: Response
) {
  try {
    const paymentId = parsePaymentId(req.params.paymentId as string);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID',
      });
    }

    const payment = await creditPayment(paymentId);

    return res.status(200).json({
      success: true,
      message: 'Payment credited successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Credit payment error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to credit payment';

    if (message === 'Payment record not found') {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function failPaymentController(
  req: Request,
  res: Response
) {
  try {
    const paymentId = parsePaymentId(req.params.paymentId as string);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID',
      });
    }

    const payment = await failPayment(paymentId);

    return res.status(200).json({
      success: true,
      message: 'Payment marked as failed',
      data: payment,
    });
  } catch (error) {
    console.error('Fail payment error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update payment';

    if (message === 'Payment record not found') {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}