import asyncHandler from 'express-async-handler';
import Report from '../models/report.js';
import Notification from '../models/notification.js';
import cloudinary from '../config/cloudinary.js';
import { sendStatusUpdateEmail } from '../utils/emailService.js';

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'wastemap',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
export const createReport = asyncHandler(async (req, res) => {
  const { longitude, latitude, address, wasteType, urgency, description } = req.body;

  // Validate required fields
  if (!longitude || !latitude || !address || !wasteType || !description) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Upload images to Cloudinary
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      res.status(400);
      throw new Error('Maximum 3 images allowed');
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer)
    );
    imageUrls = await Promise.all(uploadPromises);
  }

  // Create report
  const report = await Report.create({
    user: req.user._id,
    location: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
    address,
    wasteType,
    urgency: urgency || 'medium',
    description,
    images: imageUrls,
  });

  const populatedReport = await Report.findById(report._id).populate(
    'user',
    'name email'
  );

  // Emit socket event to admins about new report
  const io = req.app.get('io');
  io.to('admins').emit('new-report', {
    report: populatedReport,
    message: 'New waste report submitted',
  });

  res.status(201).json(populatedReport);
});

// @desc    Get all reports with filters
// @route   GET /api/reports
// @access  Public
export const getReports = asyncHandler(async (req, res) => {
  const {
    wasteType,
    status,
    urgency,
    latitude,
    longitude,
    radius, // in kilometers
    startDate,
    endDate,
  } = req.query;

  // Build query
  let query = {};

  // Filter by waste type
  if (wasteType) {
    query.wasteType = wasteType;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by urgency
  if (urgency) {
    query.urgency = urgency;
  }

  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Geospatial query - find reports within radius
  if (latitude && longitude && radius) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
      },
    };
  }

  const reports = await Report.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    count: reports.length,
    reports,
  });
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Public
export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  res.json(report);
});

// @desc    Get user's reports
// @route   GET /api/reports/my-reports
// @access  Private
export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.json({
    count: reports.length,
    reports,
  });
});

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
export const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Check if user owns the report
  if (report.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this report');
  }

  // Only allow updates if status is pending
  if (report.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot update report that is already in progress or resolved');
  }

  const { longitude, latitude, address, wasteType, urgency, description } =
    req.body;

  // Update fields
  if (longitude && latitude) {
    report.location.coordinates = [parseFloat(longitude), parseFloat(latitude)];
  }
  if (address) report.address = address;
  if (wasteType) report.wasteType = wasteType;
  if (urgency) report.urgency = urgency;
  if (description) report.description = description;

  // Handle new images
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      res.status(400);
      throw new Error('Maximum 3 images allowed');
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer)
    );
    const imageUrls = await Promise.all(uploadPromises);
    report.images = imageUrls;
  }

  const updatedReport = await report.save();
  const populatedReport = await Report.findById(updatedReport._id).populate(
    'user',
    'name email'
  );

  res.json(populatedReport);
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Check if user owns the report
  if (report.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this report');
  }

  // Only allow deletion if status is pending
  if (report.status !== 'pending') {
    res.status(400);
    throw new Error('Cannot delete report that is already in progress or resolved');
  }

  await Report.findByIdAndDelete(req.params.id);

  res.json({ message: 'Report deleted successfully' });
});

// @desc    Upvote report
// @route   POST /api/reports/:id/upvote
// @access  Private
export const upvoteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Check if user already upvoted
  const alreadyUpvoted = report.upvotedBy.includes(req.user._id);

  if (alreadyUpvoted) {
    // Remove upvote
    report.upvotedBy = report.upvotedBy.filter(
      (userId) => userId.toString() !== req.user._id.toString()
    );
    report.upvotes -= 1;
  } else {
    // Add upvote
    report.upvotedBy.push(req.user._id);
    report.upvotes += 1;
  }

  await report.save();

  res.json({
    upvotes: report.upvotes,
    upvoted: !alreadyUpvoted,
  });
});

// @desc    Get nearby reports
// @route   GET /api/reports/nearby
// @access  Public
export const getNearbyReports = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 5 } = req.query;

  if (!latitude || !longitude) {
    res.status(400);
    throw new Error('Please provide latitude and longitude');
  }

  const reports = await Report.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
      },
    },
  })
    .populate('user', 'name email')
    .limit(20);

  res.json({
    count: reports.length,
    radius: `${radius} km`,
    reports,
  });
});