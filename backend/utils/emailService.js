import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send email verification
export const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const message = `
    <h1>Welcome to WasteMap!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${verificationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, please ignore this email.</p>
    <br>
    <p>Best regards,<br>WasteMap Team</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Verify Your Email - WasteMap',
    html: message,
  });
};

// Send status update notification
export const sendStatusUpdateEmail = async (user, report, oldStatus, newStatus) => {
  const reportUrl = `${process.env.FRONTEND_URL}/reports/${report._id}`;

  const statusMessages = {
    pending: 'received and is pending review',
    'in-progress': 'being worked on',
    resolved: 'been resolved',
  };

  const message = `
    <h1>Report Status Update</h1>
    <p>Hi ${user.name},</p>
    <p>Your waste report has ${statusMessages[newStatus]}.</p>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Location:</strong> ${report.address}</p>
      <p><strong>Waste Type:</strong> ${report.wasteType}</p>
      <p><strong>Previous Status:</strong> ${oldStatus}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
    </div>
    <a href="${reportUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px;">View Report</a>
    <br><br>
    <p>Thank you for helping keep our community clean!</p>
    <p>Best regards,<br>WasteMap Team</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Report Status Update - ${newStatus}`,
    html: message,
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>Or copy and paste this link in your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
    <br>
    <p>Best regards,<br>WasteMap Team</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Password Reset Request - WasteMap',
    html: message,
  });
};

// Send announcement email
export const sendAnnouncementEmail = async (users, title, message) => {
  const recipients = users.map(user => user.email).join(',');

  const emailContent = `
    <h1>${title}</h1>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
      ${message}
    </div>
    <p>Best regards,<br>WasteMap Team</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipients,
    subject: title,
    html: emailContent,
  });
};