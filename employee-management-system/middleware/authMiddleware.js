import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Check Authorization header if token not in cookies
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_employee_admin_2026';
    const decoded = jwt.verify(token, JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Admin account no longer exists.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Token is invalid or has expired.',
    });
  }
};

export default authMiddleware;
