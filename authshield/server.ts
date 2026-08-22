import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import User from './models/User';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database Connection
  await connectDB();

  // Seed default demo accounts if database is empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AuthShield] Seeding initial demo security accounts...');
      await User.create({
        name: 'Chief Security Officer',
        email: 'admin@authshield.io',
        password: 'AdminPassword123!',
        role: 'admin',
      });
      await User.create({
        name: 'Alex Rivera',
        email: 'user@authshield.io',
        password: 'UserPassword123!',
        role: 'user',
      });
      console.log('[AuthShield] Demo accounts created successfully (admin@authshield.io / user@authshield.io)');
    }
  } catch (err: any) {
    console.warn(`[AuthShield] Demo account auto-seed notice: ${err.message}`);
  }

  // Security Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // CORS Configuration with Credentials Enabled
  app.use(
    cors({
      origin: true, // Allow requesting origin (supports iframe preview and local development)
      credentials: true, // Crucial for sending & receiving HTTP-Only cookies
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AuthShield Security Microservice',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Mount Authentication Routes
  app.use('/api/auth', authRoutes);

  // Development vs Production Mode Handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Vite] Development middleware mounted');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🛡️ AuthShield Full-Stack Security Server Active`);
    console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer();
