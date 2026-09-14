import { Request, Response } from 'express';
import { registerFarmer, getFarmerById } from '../services/farmer.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function registerFarmerController(
  req: Request,
  res: Response
) {
  try {
    const {
      fullName,
      mobile,
      aadhaarLast4,
      village,
      district,
      state,
      landAreaAcres,
      landOwnership,
      bankAccountLast4,
      bankIfsc,
    } = req.body;

    // Basic required-field validation
    if (!fullName || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Full name and mobile number are required',
      });
    }

    const farmer = await registerFarmer({
      fullName,
      mobile,
      aadhaarLast4,
      village,
      district,
      state,
      landAreaAcres,
      landOwnership,
      bankAccountLast4,
      bankIfsc,
    });

    return res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      data: {
        farmerId: farmer.farmerId,
        fullName: farmer.fullName,
        mobile: farmer.mobile,
        verificationStatus: farmer.verificationStatus,
      },
    });
  } catch (error) {
    console.error('Farmer registration error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unable to register farmer';

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

// Get the currently logged-in farmer's profile
export async function getMyProfile(
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

    const farmer = await getFarmerById(req.user.userId);

    return res.status(200).json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Farmer not found';

    return res.status(404).json({
      success: false,
      message,
    });
  }
}