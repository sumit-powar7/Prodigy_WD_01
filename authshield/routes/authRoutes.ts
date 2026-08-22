import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  getAuditLogs,
  seedDemoAccounts,
} from '../controllers/authController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/demo-seed', seedDemoAccounts);

// Protected routes (User & Admin)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/audit-logs', protect, getAuditLogs);

// Admin-only routes
router.get('/admin-dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);

export default router;
