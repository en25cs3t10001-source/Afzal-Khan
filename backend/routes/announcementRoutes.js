import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAnnouncements)
  .post(authorizeRoles('HR'), createAnnouncement);

router.route('/:id')
  .put(authorizeRoles('HR'), updateAnnouncement)
  .delete(authorizeRoles('HR'), deleteAnnouncement);

export default router;
