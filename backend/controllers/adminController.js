import asyncHandler from 'express-async-handler';
import Report from '../models/report.js';
import User from '../models/user.js';
import Notification from '../models/notification.js';
import { sendStatusUpdateEmail, sendAnnouncementEmail } from '../utils/emailService.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Total reports
  const totalReports = await Report.countDocuments();

  // Reports by status
  const pendingReports = await Report.countDocuments({ status: 'pending' });
  const inProgressReports = await Report.countDocuments({ status: 'in-progress' });
  const resolvedReports = await Report.countDocuments({ status: 'resolved' });

  // Reports by waste type
  const reportsByWasteType = await Report.aggregate([
    {
      $group: {
        _id: '$wasteType',
        count: { $sum: 1 },
      },
    },
  ]);

  // Reports by urgency
  const reportsByUrgency = await Report.aggregate([
    {
      $group: {
        _id: '$urgency',
        count: { $sum: 1 },
      },
    },
  ]);

  // Reports over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const reportsOverTime = await Report.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Total users
  const totalUsers = await User.countDocuments();

  // Recent reports
  const recentReports = await Report.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalReports,
    reportsByStatus: {
      pending: pendingReports,
      inProgress: inProgressReports,
      resolved: resolvedReports,
    },
    reportsByWasteType,
    reportsByUrgency,
    reportsOverTime,
    totalUsers,
    recentReports,
  });
});

// @desc    Update report status (Admin only)
// @route   PUT /api/admin/reports/:id/status
// @access  Private/Admin
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const report = await Report.findById(req.params.id).populate('user', 'name email notificationPreferences');

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  const oldStatus = report.status;

  // Update status and notes
  report.status = status || report.status;
  if (adminNotes) {
    report.adminNotes = adminNotes;
  }

  const updatedReport = await report.save();

  // Create notification for user
  const notification = await Notification.create({
    user: report.user._id,
    type: 'status_update',
    title: 'Report Status Updated',
    message: `Your report status has been updated to: ${status}`,
    relatedReport: report._id,
  });

  // Emit socket event to user
  const io = req.app.get('io');
  io.to(`user:${report.user._id}`).emit('notification', {
    notification,
    message: 'Report status updated',
  });

  // Send email notification if user has it enabled
  if (report.user.notificationPreferences.statusUpdates) {
    try {
      await sendStatusUpdateEmail(report.user, report, oldStatus, status);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  const populatedReport = await Report.findById(updatedReport._id).populate(
    'user',
    'name email'
  );

  res.json(populatedReport);
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  res.json({
    count: users.length,
    users,
  });
});

// @desc    Get user details with reports
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const userReports = await Report.find({ user: req.params.id }).sort({
    createdAt: -1,
  });

  res.json({
    user,
    reports: userReports,
    totalReports: userReports.length,
  });
});

// @desc    Send announcement to all users
// @route   POST /api/admin/announcements
// @access  Private/Admin
export const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    res.status(400);
    throw new Error('Please provide title and message');
  }

  // Get all users
  const users = await User.find({ emailVerified: true });

  if (users.length === 0) {
    res.status(400);
    throw new Error('No verified users to send announcement to');
  }

  // Create notifications for all users
  const notifications = users.map((user) => ({
    user: user._id,
    type: 'announcement',
    title,
    message,
  }));

  await Notification.insertMany(notifications);

  // Send emails (in batches to avoid overwhelming email service)
  try {
    await sendAnnouncementEmail(users, title, message);
  } catch (error) {
    console.error('Failed to send announcement emails:', error);
  }

  res.json({
    message: `Announcement sent to ${users.length} users`,
    recipientCount: users.length,
  });
});

// @desc    Export reports to CSV
// @route   GET /api/admin/reports/export
// @access  Private/Admin
export const exportReports = asyncHandler(async (req, res) => {
  const reports = await Report.find().populate('user', 'name email');

  // Convert to CSV format
  const csvHeaders = [
    'ID',
    'User Name',
    'User Email',
    'Address',
    'Waste Type',
    'Urgency',
    'Status',
    'Description',
    'Upvotes',
    'Created At',
    'Updated At',
  ];

  const csvRows = reports.map((report) => [
    report._id,
    report.user.name,
    report.user.email,
    report.address,
    report.wasteType,
    report.urgency,
    report.status,
    `"${report.description.replace(/"/g, '""')}"`, // Escape quotes in description
    report.upvotes,
    report.createdAt.toISOString(),
    report.updatedAt.toISOString(),
  ]);

  // Build CSV string
  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map((row) => row.join(',')),
  ].join('\n');

  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');

  res.send(csvContent);
});