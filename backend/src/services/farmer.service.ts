import prisma from '../config/prisma.js';

interface RegisterFarmerData {
  fullName: string;
  mobile: string;
  aadhaarLast4?: string;
  village?: string;
  district?: string;
  state?: string;
  landAreaAcres?: number;
  landOwnership?: string;
  bankAccountLast4?: string;
  bankIfsc?: string;
}

// Register a new farmer
export async function registerFarmer(data: RegisterFarmerData) {
  // Check whether this mobile number is already registered
  const existingFarmer = await prisma.user.findUnique({
    where: {
      mobile: data.mobile,
    },
  });

  if (existingFarmer) {
    throw new Error('A farmer with this mobile number already exists');
  }

  // Generate a simple Farmer ID
  const farmerId = `F${Date.now().toString().slice(-6)}`;

  const farmer = await prisma.user.create({
    data: {
      farmerId,
      fullName: data.fullName,
      mobile: data.mobile,

      // Temporary value for development.
      // Authentication is currently handled using OTP.
      passwordHash: 'TEMPORARY',

      aadhaarLast4: data.aadhaarLast4,
      village: data.village,
      district: data.district,
      state: data.state,

      landAreaAcres: data.landAreaAcres,
      landOwnership: data.landOwnership,

      bankAccountLast4: data.bankAccountLast4,
      bankIfsc: data.bankIfsc,
    },
  });

  return farmer;
}

// Get the currently authenticated farmer
export async function getFarmerById(userId: number) {
  const farmer = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      farmerId: true,
      fullName: true,
      mobile: true,
      aadhaarLast4: true,
      role: true,
      verificationStatus: true,
      village: true,
      district: true,
      state: true,
      landAreaAcres: true,
      landOwnership: true,
      bankAccountLast4: true,
      bankIfsc: true,
      createdAt: true,
    },
  });

  if (!farmer) {
    throw new Error('Farmer not found');
  }

  return farmer;
}