import asyncHandler from 'express-async-handler';
import notification from '../models/notification.js';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .populate('relatedReport', 'address wasteType status')
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({
    notifications,
    unreadCount,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if user owns the notification
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  notification.isRead = true;
  await notification.save();

  res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if user owns the notification
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await notification.findByIdAndDelete(req.params.id);

  res.json({ message: 'Notification deleted' });
});