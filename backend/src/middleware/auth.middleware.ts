import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    farmerId: string;
    role: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    // Check whether Authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Make sure decoded JWT contains the fields we expect
    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'number' ||
      typeof decoded.farmerId !== 'string' ||
      typeof decoded.role !== 'string'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    // Attach authenticated user to request
    req.user = {
      userId: decoded.userId,
      farmerId: decoded.farmerId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
}

/**
 * Allows only ADMIN users to access operator endpoints.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

 if (
  req.user.role !== 'ADMIN' &&
  req.user.role !== 'OPERATOR'
) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
}