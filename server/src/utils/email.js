const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"USMS" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

const passwordResetEmail = (name, resetUrl) => ({
  subject: 'Password Reset Request - USMS',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#2563eb">University Student Management System</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset. Click below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:4px;margin:16px 0">Reset Password</a>
      <p>This link expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, ignore this email.</p>
      <hr/>
      <small style="color:#666">USMS &copy; ${new Date().getFullYear()}</small>
    </div>
  `,
});

module.exports = { sendEmail, passwordResetEmail };
