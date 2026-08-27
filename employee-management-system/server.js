import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Initialize Mongoose Models first before DB connection
import './models/Admin.js';
import './models/Employee.js';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Connect to MongoDB
  await connectDB();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Employee Management API Running' });
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Employee Management System running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
