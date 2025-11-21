import express from 'express';
import {
  createReport,
  getReports,
  getReportById,
  getMyReports,
  updateReport,
  deleteReport,
  upvoteReport,
  getNearbyReports,
} from '../controllers/reportController.js';
import { protect } from '../middleware/Auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getReports);
router.get('/nearby', getNearbyReports);
router.get('/:id', getReportById);

// Protected routes
router.post('/', protect, upload.array('images', 3), createReport);
router.get('/user/my-reports', protect, getMyReports);
router.put('/:id', protect, upload.array('images', 3), updateReport);
router.delete('/:id', protect, deleteReport);
router.post('/:id/upvote', protect, upvoteReport);

export default router;