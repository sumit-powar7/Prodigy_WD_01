import express from 'express';
import { setupAdmin, login, logout, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/setup-admin - Create first/initial admin account
router.post('/setup-admin', setupAdmin);

// POST /api/auth/login - Admin login
router.post('/login', login);

// POST /api/auth/logout - Logout admin
router.post('/logout', logout);

// GET /api/auth/me - Verify current session
router.get('/me', authMiddleware, getMe);

export default router;
