import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { seedDemoData } from './config/seed.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import trainingRoutes from './routes/trainingRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/training', trainingRoutes);

// Database Health & Status route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'StaffSync HRMS API',
    timestamp: new Date().toISOString(),
  });
});

// Seed endpoint for testing or manual triggers
app.post('/api/seed', async (req, res) => {
  try {
    await seedDemoData();
    res.status(200).json({ success: true, message: 'Demo data seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
  });
});

// Connect to DB and optionally seed if this file is the entry point
export const initializeBackend = async () => {
  await connectDB();
  await seedDemoData();
};

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.AIS_EMBEDDED) {
  // Only start listening if executed directly (not imported as an embedded middleware)
  if (import.meta.url === `file://${process.argv[1]}`) {
    initializeBackend().then(() => {
      app.listen(PORT, () => {
        console.log(`[StaffSync Backend] Server running on port ${PORT}`);
      });
    });
  }
}

export default app;
