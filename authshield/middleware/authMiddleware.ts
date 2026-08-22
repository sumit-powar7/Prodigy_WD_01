import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  token?: string;
}

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Protect middleware:
 * Verifies JWT token stored in HTTP-Only cookie or Authorization Bearer header.
 * Attaches authenticated user object to req.user.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Check HTTP-Only Cookie
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fallback to Authorization Header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
      code: 'AUTH_NO_TOKEN',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'authshield_super_secret_jwt_key_2026_safe_fallback';
    const decoded = jwt.verify(token, secret) as DecodedToken;

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. User account no longer exists.',
        code: 'AUTH_USER_NOT_FOUND',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error: any) {
    console.warn(`[Security] JWT Verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Token is invalid or expired.',
      code: 'AUTH_TOKEN_INVALID',
    });
  }
};

/**
 * Authorize middleware:
 * Restricts access to specified user roles (e.g. 'admin').
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization check.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource. Required role: [${roles.join(', ')}]`,
        code: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
};
