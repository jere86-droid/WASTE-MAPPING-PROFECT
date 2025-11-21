import express from 'express';
import {
  getDashboardStats,
  updateReportStatus,
  getAllUsers,
  getUserDetails,
  sendAnnouncement,
  exportReports,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/Auth.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

// Dashboard & Statistics
router.get('/stats', getDashboardStats);

// Report Management
router.put('/reports/:id/status', updateReportStatus);
router.get('/reports/export', exportReports);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);

// Announcements
router.post('/announcements', sendAnnouncement);

export default router;