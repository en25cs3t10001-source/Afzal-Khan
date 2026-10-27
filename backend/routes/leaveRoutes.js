import express from 'express';
import {
  getLeaves,
  applyLeave,
  updateLeaveStatus,
  deleteLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLeaves)
  .post(applyLeave);

router.route('/:id')
  .put(authorizeRoles('HR', 'Manager'), updateLeaveStatus)
  .delete(deleteLeave);

export default router;
