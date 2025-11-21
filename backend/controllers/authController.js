import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex');

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  if (user) {
    // Send verification email
    try {
      await sendVerificationEmail(user, emailVerificationToken);
    } catch (error) {
      console.error('Email send error:', error);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  // Hash the token from URL
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  // Update user
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.json({
    message: 'Email verified successfully',
    emailVerified: true,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      notificationPreferences: user.notificationPreferences,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...req.body.notificationPreferences,
      };
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      notificationPreferences: updatedUser.notificationPreferences,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    message: 'Password updated successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  // Send email
  try {
    await sendPasswordResetEmail(user, resetToken);
    res.json({
      message: 'Password reset email sent',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  // Hash the token from URL
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    message: 'Password reset successful',
    token: generateToken(user._id),
  });
});