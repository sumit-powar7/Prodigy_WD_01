import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// In-Memory Security Audit Logger
export interface AuditLogItem {
  id: string;
  timestamp: string;
  type: 'REGISTER' | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'ROLE_CHANGE' | 'ADMIN_ACCESS';
  userEmail: string;
  ip: string;
  details: string;
  severity: 'info' | 'warning' | 'high';
}

const auditLogs: AuditLogItem[] = [];

const logSecurityEvent = (
  type: AuditLogItem['type'],
  userEmail: string,
  ip: string,
  details: string,
  severity: AuditLogItem['severity'] = 'info'
) => {
  const item: AuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    userEmail,
    ip: ip || '127.0.0.1',
    details,
    severity,
  };
  auditLogs.unshift(item);
  if (auditLogs.length > 100) auditLogs.pop(); // Keep last 100 logs
};

/**
 * Helper to generate JWT token and attach HTTP-Only Cookie
 */
const sendTokenResponse = (user: any, statusCode: number, res: Response, req: Request) => {
  const secret = process.env.JWT_SECRET || 'authshield_super_secret_jwt_key_2026_safe_fallback';
  const token = jwt.sign({ id: user._id }, secret, {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as any,
  });

  const isProd = process.env.NODE_ENV === 'production';

  // Set HTTP-Only Secure Cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax', // Compatible with local dev iframe preview and top-level navigation
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 Days
  });

  res.status(statusCode).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    tokenDetails: {
      storage: 'HTTP-Only Secure Cookie',
      sameSite: 'Lax',
      httpOnly: true,
      expiresIn: process.env.JWT_EXPIRE || '30d',
    },
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      logSecurityEvent(
        'REGISTER',
        email,
        req.ip || req.socket.remoteAddress || '127.0.0.1',
        `Registration attempt failed: Duplicate email '${email}'`,
        'warning'
      );
      return res.status(400).json({
        success: false,
        message: 'A user account with this email address already exists',
      });
    }

    // Assign role (defaults to 'user', allows 'admin' if specified)
    const userRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
    });

    logSecurityEvent(
      'REGISTER',
      user.email,
      req.ip || req.socket.remoteAddress || '127.0.0.1',
      `New user registered with role '${user.role}'`,
      'info'
    );

    sendTokenResponse(user, 201, res, req);
  } catch (error: any) {
    console.error(`Register Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Authenticate user & get token via cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      logSecurityEvent(
        'LOGIN_FAILED',
        email,
        req.ip || req.socket.remoteAddress || '127.0.0.1',
        'Login failed: Non-existent email address',
        'warning'
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check email or password.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logSecurityEvent(
        'LOGIN_FAILED',
        email,
        req.ip || req.socket.remoteAddress || '127.0.0.1',
        'Login failed: Password mismatch',
        'high'
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Check email or password.',
      });
    }

    logSecurityEvent(
      'LOGIN_SUCCESS',
      user.email,
      req.ip || req.socket.remoteAddress || '127.0.0.1',
      `User successfully authenticated (${user.role})`,
      'info'
    );

    sendTokenResponse(user, 200, res, req);
  } catch (error: any) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during authentication',
    });
  }
};

/**
 * @desc    Log user out / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = async (req: AuthRequest, res: Response) => {
  const email = req.user?.email || 'Guest';

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
  });

  logSecurityEvent(
    'LOGOUT',
    email,
    req.ip || req.socket.remoteAddress || '127.0.0.1',
    'User session ended, HTTP-Only cookie cleared',
    'info'
  );

  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Cookie token destroyed.',
  });
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @desc    Get admin dashboard metrics & stats
 * @route   GET /api/auth/admin-dashboard
 * @access  Private/Admin
 */
export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const standardUserCount = await User.countDocuments({ role: 'user' });

    logSecurityEvent(
      'ADMIN_ACCESS',
      req.user?.email || 'admin',
      req.ip || req.socket.remoteAddress || '127.0.0.1',
      'Accessed Admin Dashboard & System Security Metrics',
      'info'
    );

    res.status(200).json({
      success: true,
      message: 'Welcome to the Secure Admin Command Center',
      stats: {
        totalUsers,
        adminCount,
        standardUserCount,
        activeSessions: auditLogs.filter((l) => l.type === 'LOGIN_SUCCESS').length,
        failedLoginAttempts: auditLogs.filter((l) => l.type === 'LOGIN_FAILED').length,
        bcryptRounds: 10,
        jwtSecurity: 'HTTP-Only, SameSite=Lax, SHA-256 Signed',
        uptime: process.uptime(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin metrics',
    });
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user list',
    });
  }
};

/**
 * @desc    Update user role (Admin toggle)
 * @route   PUT /api/auth/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    logSecurityEvent(
      'ROLE_CHANGE',
      req.user?.email || 'admin',
      req.ip || req.socket.remoteAddress || '127.0.0.1',
      `Updated role for user '${user.email}' from '${oldRole}' to '${role}'`,
      'warning'
    );

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: user.getPublicProfile(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
    });
  }
};

/**
 * @desc    Get Security Audit Logs
 * @route   GET /api/auth/audit-logs
 * @access  Private
 */
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    logs: auditLogs,
  });
};

/**
 * @desc    Seed sample accounts for instant testing
 * @route   POST /api/auth/demo-seed
 * @access  Public
 */
export const seedDemoAccounts = async (req: Request, res: Response) => {
  try {
    const adminExists = await User.findOne({ email: 'admin@authshield.io' });
    let adminUser = adminExists;
    if (!adminExists) {
      adminUser = await User.create({
        name: 'Chief Security Officer',
        email: 'admin@authshield.io',
        password: 'AdminPassword123!',
        role: 'admin',
      });
    }

    const userExists = await User.findOne({ email: 'user@authshield.io' });
    let standardUser = userExists;
    if (!userExists) {
      standardUser = await User.create({
        name: 'Alex Rivera',
        email: 'user@authshield.io',
        password: 'UserPassword123!',
        role: 'user',
      });
    }

    logSecurityEvent('REGISTER', 'system@authshield.io', '127.0.0.1', 'Demo security accounts seeded successfully', 'info');

    res.status(200).json({
      success: true,
      message: 'Demo accounts seeded successfully!',
      accounts: {
        admin: { email: 'admin@authshield.io', password: 'AdminPassword123!', role: 'admin' },
        user: { email: 'user@authshield.io', password: 'UserPassword123!', role: 'user' },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed demo accounts',
    });
  }
};
