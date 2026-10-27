import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './backend/config/db.js';
import { seedDemoData } from './backend/config/seed.js';

import authRoutes from './backend/routes/authRoutes.js';
import userRoutes from './backend/routes/userRoutes.js';
import leaveRoutes from './backend/routes/leaveRoutes.js';
import attendanceRoutes from './backend/routes/attendanceRoutes.js';
import announcementRoutes from './backend/routes/announcementRoutes.js';
import trainingRoutes from './backend/routes/trainingRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Initialize Database & Seed data
  try {
    console.log('[Server] Connecting to MongoDB database...');
    await connectDB();
    await seedDemoData();
    console.log('[Server] MongoDB connected and seed data verified.');
  } catch (err: any) {
    console.error('[Server] Database initialization failed:', err.message);
  }

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/leaves', leaveRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/announcements', announcementRoutes);
  app.use('/api/training', trainingRoutes);

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      system: 'StaffSync HRMS MERN API',
      timestamp: new Date().toISOString(),
    });
  });

  // Seed endpoint for testing
  app.post('/api/seed', async (_req, res) => {
    try {
      await seedDemoData();
      res.status(200).json({ success: true, message: 'Demo data re-seeded' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Vite Dev Server middleware mode
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode');
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving production static files from dist');
  }

  app.listen(PORT, () => {
    console.log(`[StaffSync] Full-Stack application listening on http://localhost:${PORT}`);
  });
}

startServer();
