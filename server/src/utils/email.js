const https = require('https');
const logger = require('./logger');

const sendEmail = ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY not set in environment');

  const fromEmail = process.env.EMAIL_FROM_ADDRESS || 'no-reply@usms.app';
  const fromName  = process.env.EMAIL_FROM_NAME    || 'USMS';

  const payload = JSON.stringify({
    sender:      { name: fromName, email: fromEmail },
    to:          [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path:     '/v3/smtp/email',
        method:   'POST',
        headers: {
          'accept':         'application/json',
          'api-key':        apiKey,
          'content-type':   'application/json',
          'content-length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            logger.info(`Email sent to ${to}`);
            resolve();
          } else {
            let msg = `Brevo API error ${res.statusCode}`;
            try { msg = JSON.parse(body).message || msg; } catch {}
            logger.error(`Email send failed: ${msg}`);
            reject(new Error(msg));
          }
        });
      }
    );

    req.on('error', (err) => {
      logger.error(`Email send failed: ${err.message}`);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
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
        <p style="color:#374151">Click the button below to reset your password:</p>
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