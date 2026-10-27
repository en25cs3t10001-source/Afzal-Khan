import express from 'express';
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
} from '../controllers/trainingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTrainings)
  .post(authorizeRoles('HR', 'Manager'), createTraining);

router.route('/:id')
  .put(authorizeRoles('HR', 'Manager'), updateTraining)
  .delete(authorizeRoles('HR', 'Manager'), deleteTraining);

export default router;
