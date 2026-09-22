import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function requestOtp(mobile: string) {
  const farmer = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!farmer) {
    throw new Error('No farmer is registered with this mobile number');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpHash = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpVerification.updateMany({
    where: {
      mobile,
      verified: false,
    },
    data: {
      verified: true,
    },
  });

  await prisma.otpVerification.create({
    data: {
      mobile,
      otpHash,
      expiresAt,
    },
  });

  // Development only — replace with SMS provider later.
  console.log(`OTP for ${mobile}: ${otp}`);

  return {
    farmerId: farmer.farmerId,
    expiresIn: 300,
  };
}

export async function verifyOtp(mobile: string, otp: string) {
  const farmer = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!farmer) {
    throw new Error('No farmer is registered with this mobile number');
  }

  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      mobile,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    throw new Error('No active OTP found. Please request a new OTP');
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error('OTP has expired. Please request a new OTP');
  }

  const otpHash = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  if (otpHash !== otpRecord.otpHash) {
    throw new Error('Invalid OTP');
  }

  await prisma.otpVerification.update({
    where: {
      id: otpRecord.id,
    },
    data: {
      verified: true,
    },
  });

  const token = jwt.sign(
    {
      userId: farmer.id,
      farmerId: farmer.farmerId,
      role: farmer.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

  return {
    token,
    farmer: {
      id: farmer.id,
      farmerId: farmer.farmerId,
      fullName: farmer.fullName,
      mobile: farmer.mobile,
      role: farmer.role,
      verificationStatus: farmer.verificationStatus,
    },
  };
}

/**
 * Demo authentication.
 *
 * This endpoint is intentionally separate from the real OTP flow.
 * It is used only when DEMO_AUTH_ENABLED=true.
 *
 * The mobile app generates and verifies the demo OTP locally.
 * This function only prepares a normal JWT so that all existing
 * authenticated APIs continue to work exactly as before.
 */
export async function demoLogin(mobile: string) {
  if (process.env.DEMO_AUTH_ENABLED !== 'true') {
    throw new Error('Demo authentication is disabled');
  }

  const farmer = await prisma.user.findUnique({
    where: { mobile },
  });

  if (!farmer) {
    throw new Error('No farmer is registered with this mobile number');
  }

  const token = jwt.sign(
    {
      userId: farmer.id,
      farmerId: farmer.farmerId,
      role: farmer.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

  return {
    token,
    farmer: {
      id: farmer.id,
      farmerId: farmer.farmerId,
      fullName: farmer.fullName,
      mobile: farmer.mobile,
      role: farmer.role,
      verificationStatus: farmer.verificationStatus,
    },
  };
}