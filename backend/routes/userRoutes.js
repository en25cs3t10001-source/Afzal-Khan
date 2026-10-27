import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorizeRoles('HR'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(authorizeRoles('HR'), deleteUser);

export default router;
