import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All employee CRUD routes are protected by admin auth middleware
router.use(authMiddleware);

router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', createEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
