const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { sendEmail, verificationEmail, passwordResetEmail } = require('../utils/email');

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    if (existing.isEmailVerified) throw new ApiError(409, 'Email already registered');
    // Unverified: update creds and resend
    existing.name = name;
    existing.password = password;
    existing.role = role || existing.role;
    const otp = existing.createEmailVerificationOtp();
    await existing.save();
    await sendEmail({ to: existing.email, ...verificationEmail(existing.name, otp) });
    return { user: existing };
  }

  const user = await User.create({ name, email, password, role: role || 'student' });

  const otp = user.createEmailVerificationOtp();
  await user.save({ validateBeforeSave: false });
  try {
    await sendEmail({ to: user.email, ...verificationEmail(user.name, otp) });
  } catch {
    user.emailVerificationOtp = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Could not send verification email. Try again.');
  }

  return { user };
};

const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select('+emailVerificationOtp +emailVerificationExpires');
  if (!user) throw new ApiError(400, 'No account found with this email');
  if (user.isEmailVerified) throw new ApiError(400, 'Email already verified');
  if (!user.emailVerificationOtp || !user.emailVerificationExpires)
    throw new ApiError(400, 'No OTP found. Please register again.');
  if (user.emailVerificationExpires < Date.now())
    throw new ApiError(400, 'OTP has expired. Please register again.');

  const hashed = crypto.createHash('sha256').update(otp).digest('hex');
  if (hashed !== user.emailVerificationOtp)
    throw new ApiError(400, 'Invalid OTP');

  user.isEmailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(401, 'Account is deactivated');
  if (!user.isEmailVerified) throw new ApiError(403, 'Please verify your email before logging in');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (token) => {
  if (!token) throw new ApiError(401, 'Refresh token required');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token mismatch');
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

const forgotPassword = async (email, resetUrlBase) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No user with that email');

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${resetUrlBase}/${resetToken}`;
  const emailContent = passwordResetEmail(user.name, resetUrl);

  try {
    await sendEmail({ to: user.email, ...emailContent });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Email could not be sent');
  }

  return resetToken;
};

const resetPassword = async (token, password) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return user;
};

module.exports = { register, verifyEmail, login, refreshAccessToken, logout, forgotPassword, resetPassword };
