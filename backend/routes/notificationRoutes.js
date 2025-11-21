import express from 'express';
import{
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
}  from '../controllers/notificationController.js';
import { protect } from '../middleware/Auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;