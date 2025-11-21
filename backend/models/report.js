import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Please add coordinates'],
      },
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    wasteType: {
      type: String,
      enum: ['plastic', 'organic', 'metal', 'electronic', 'mixed', 'hazardous'],
      required: [true, 'Please select a waste type'],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 3;
        },
        message: 'Cannot upload more than 3 images',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      maxlength: [500, 'Admin notes cannot be more than 500 characters'],
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
reportSchema.index({ location: '2dsphere' });

// Index for faster queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ user: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;