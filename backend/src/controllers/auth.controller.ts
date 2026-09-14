import { Request, Response } from 'express';
import {
  requestOtp,
  verifyOtp,
} from '../services/auth.service.js';

export async function requestOtpController(
  req: Request,
  res: Response
) {
  try {
    const { mobile } = req.body;

    if (!mobile || typeof mobile !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be 10 digits',
      });
    }

    const result = await requestOtp(mobile);

    return res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      data: result,
    });
  } catch (error) {
    console.error('OTP request error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to generate OTP';

    return res.status(404).json({
      success: false,
      message,
    });
  }
}

export async function verifyOtpController(
  req: Request,
  res: Response
) {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || typeof mobile !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be 10 digits',
      });
    }

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'OTP is required',
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    const result = await verifyOtp(mobile, otp);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    console.error('OTP verification error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to verify OTP';

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

