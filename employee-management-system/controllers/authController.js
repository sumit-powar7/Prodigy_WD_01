import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_employee_admin_2026';

// Helper to set JWT in HttpOnly Cookie
const sendTokenResponse = (admin, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Also provided in JSON for clients using Authorization header
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || 'Administrator',
      },
    });
};

/**
 * @desc Setup initial admin account or create new admin
 * @route POST /api/auth/setup-admin
 * @access Public (Initial Setup)
 */
export const setupAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required for admin setup.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin with this email already exists. Please log in.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || 'Administrator',
    });

    sendTokenResponse(admin, 201, res, 'Admin account created and logged in successfully.');
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during admin setup.',
    });
  }
};

/**
 * @desc Login admin user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(admin, 200, res, 'Admin login successful.');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * @desc Logout admin user & clear cookie
 * @route POST /api/auth/logout
 * @access Public / Private
 */
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Admin logged out successfully.',
  });
};

/**
 * @desc Get currently authenticated admin details
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name || 'Administrator',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user session.',
    });
  }
};
