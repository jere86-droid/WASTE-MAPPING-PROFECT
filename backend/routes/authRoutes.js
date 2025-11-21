import express from 'express';
import {
  register,
  verifyEmail,
  login,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/Auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;