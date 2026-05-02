const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'USMS <noreply@yourdomain.com>';

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(error.message);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    throw new Error('Email could not be sent');
  }
};

const verificationEmail = (name, otp) => ({
  subject: 'Your verification code – USMS',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:12px">
      <div style="background:#2563eb;padding:20px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">USMS</h1>
        <p style="color:#bfdbfe;margin:4px 0 0">University Student Management System</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
        <h2 style="color:#111827;margin-top:0">Verify your email address</h2>
        <p style="color:#374151">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151">Use the code below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0">
          <div style="display:inline-block;padding:20px 40px;background:#f1f5f9;border-radius:12px;border:2px dashed #2563eb">
            <span style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#2563eb">${otp}</span>
          </div>
        </div>
        <p style="color:#6b7280;font-size:14px">If you didn't create an account, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center">USMS &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `,
});

const passwordResetEmail = (name, resetUrl) => ({
  subject: 'Password Reset Request – USMS',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:12px">
      <div style="background:#2563eb;padding:20px 32px;border-radius:8px 8px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">USMS</h1>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
        <h2 style="color:#111827;margin-top:0">Reset your password</h2>
        <p style="color:#374151">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151">You requested a password reset. Click the button below:</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px">
            Reset Password
          </a>
        </div>
        <p style="color:#6b7280;font-size:14px">This link expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center">USMS &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `,
});

module.exports = { sendEmail, verificationEmail, passwordResetEmail };
