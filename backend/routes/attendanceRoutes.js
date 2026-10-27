import express from 'express';
import {
  getAttendance,
  markAttendance,
  getEmployeeAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(markAttendance);

router.route('/:employeeId')
  .get(getEmployeeAttendance);

export default router;
