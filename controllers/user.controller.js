const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 8;
const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const isPasswordManagedProvider = (user) => user.provider === "local";

const createTransporter = () => {
  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    const error = new Error("Email service is not configured");
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

const storePasswordResetOtp = async (user) => {
  const otp = generateOtp();
  user.passwordResetOtp = {
    code: await bcrypt.hash(otp, SALT_ROUNDS),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  };
  await user.save();
  return otp;
};

const hasActiveOtp = (otpState) => {
  return Boolean(
    otpState &&
      otpState.code &&
      otpState.expiresAt &&
      new Date(otpState.expiresAt).getTime() > Date.now(),
  );
};

const validateOtp = async (otp, otpState) => {
  if (!hasActiveOtp(otpState)) {
    return false;
  }

  return bcrypt.compare(otp, otpState.code);
};

const clearPasswordResetOtp = (user) => {
  user.passwordResetOtp = {
    code: undefined,
    expiresAt: undefined,
  };
};

const storeOtpForField = async (user, fieldName) => {
  const otp = generateOtp();
  user[fieldName] = {
    code: await bcrypt.hash(otp, SALT_ROUNDS),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  };
  await user.save();
  return otp;
};

const clearOtpForField = (user, fieldName) => {
  user[fieldName] = {
    code: undefined,
    expiresAt: undefined,
  };
};

const sendOtpEmail = async ({ to, subject, otp, action }) => {
  const transporter = createTransporter();
  const previewText = `${otp} is your verification code. It expires in 10 minutes.`;

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    text: `${action}. Your OTP is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4efe8; font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
          <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
            ${previewText}
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(180deg, #f7f1e8 0%, #efe4d3 100%); margin: 0; padding: 32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 620px; background-color: #fffdfa; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(109, 76, 47, 0.16);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #7c3f00 0%, #c8791d 52%, #f0b45a 100%); padding: 40px 36px 32px; text-align: left;">
                      <div style="display: inline-block; padding: 8px 14px; border-radius: 999px; background-color: rgba(255, 255, 255, 0.18); color: #fff7ed; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">
                        Secure Verification
                      </div>
                      <h1 style="margin: 18px 0 10px; font-size: 30px; line-height: 1.2; color: #ffffff; font-weight: 800;">
                        ${subject}
                      </h1>
                      <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #fff3e0; max-width: 460px;">
                        ${action}. Enter the code below to continue securely with your account.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 36px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fff7ed; border: 1px solid #f1d2a8; border-radius: 20px;">
                        <tr>
                          <td style="padding: 28px; text-align: center;">
                            <p style="margin: 0 0 12px; color: #9a3412; font-size: 13px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;">
                              One-Time Password
                            </p>
                            <div style="display: inline-block; padding: 16px 24px; border-radius: 16px; background-color: #ffffff; border: 1px dashed #d97706; font-size: 34px; line-height: 1; letter-spacing: 10px; font-weight: 800; color: #7c2d12;">
                              ${otp}
                            </div>
                            <p style="margin: 14px 0 0; font-size: 14px; line-height: 1.6; color: #7c2d12;">
                              This code expires in <strong>10 minutes</strong>.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 28px 0 0; font-size: 15px; line-height: 1.8; color: #374151;">
                        For your security, never share this OTP with anyone. Our team will never ask for this code by email or phone.
                      </p>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 24px; background-color: #f9fafb; border-radius: 18px;">
                        <tr>
                          <td style="padding: 18px 20px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #4b5563;">
                              If you did not request this code, you can safely ignore this email and no changes will be made to your account.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 36px 34px;">
                      <div style="height: 1px; background-color: #ead7bf;"></div>
                      <p style="margin: 22px 0 0; font-size: 12px; line-height: 1.8; color: #6b7280; text-align: center;">
                        Sent securely by Cinema Booking System
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

const sendConfirmationOtpEmail = async (user) => {
  const otp = await storeOtpForField(user, "confirmationOtp");
  await sendOtpEmail({
    to: user.email,
    subject: "Confirm your email",
    otp,
    action: "Use this OTP to confirm your email address",
  });
};

const sendDeleteProfileOtpEmail = async (user) => {
  const otp = await storeOtpForField(user, "deleteProfileOtp");
  await sendOtpEmail({
    to: user.email,
    subject: "Delete your profile",
    otp,
    action: "Use this OTP to permanently delete your profile",
  });
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "ay 7aga",
    { expiresIn: "1d" },
  );
};

const signup = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      dateOfBirth,
      confirmed: false,
      provider: "local",
    });
    await sendConfirmationOtpEmail(user);

    return res.status(201).json({
      success: true,
      message: "User created successfully. Please confirm your email.",
      data: {
        user,
        requiresEmailConfirmation: true,
      },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (isPasswordManagedProvider(user) && !user.confirmed) {
      return res.status(403).json({
        message: "Please confirm your email before signing in",
        data: {
          email: user.email,
          requiresEmailConfirmation: true,
        },
      });
    }

    const token = generateToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "GOOGLE_CLIENT_ID is not configured",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const email = normalizeEmail(payload.email);
    const fullName = [payload.given_name, payload.family_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, SALT_ROUNDS);

      user = await User.create({
        name: fullName || payload.name || "Google User",
        email,
        password: hashedPassword,
        confirmed: true,
        provider: "google",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!isPasswordManagedProvider(user)) {
      return res.status(400).json({
        message: "Password update is not available for this account provider",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.changeCredentialTime = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const forgetPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (user && isPasswordManagedProvider(user) && user.confirmed) {
      const otp = await storePasswordResetOtp(user);
      await sendOtpEmail({
        to: user.email,
        subject: "Reset your password",
        otp,
        action: "Use this OTP to reset your password",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If the account exists a password reset OTP has been sent to the registered email.",
    });
  } catch (error) {
    next(error);
  }
};

const resendPasswordResetOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email }).select("+passwordResetOtp.code");

    if (
      user &&
      isPasswordManagedProvider(user) &&
      user.confirmed &&
      hasActiveOtp(user.passwordResetOtp)
    ) {
      const otp = await storePasswordResetOtp(user);
      await sendOtpEmail({
        to: user.email,
        subject: "Reset your password",
        otp,
        action: "Use this OTP to reset your password",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If a password reset request is active, a new OTP has been sent to the registered email.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { otp, newPassword } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email }).select(
      "+password +passwordResetOtp.code",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!isPasswordManagedProvider(user)) {
      return res.status(400).json({
        message: "Password reset is not available for this account provider",
      });
    }

    const isValidOtp = await validateOtp(otp, user.passwordResetOtp);

    if (!isValidOtp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.changeCredentialTime = new Date();
    clearPasswordResetOtp(user);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

const confirmEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email }).select("+confirmationOtp.code");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.confirmed) {
      return res.status(200).json({
        success: true,
        message: "Email is already confirmed",
        data: { user },
      });
    }

    const isValidOtp = await validateOtp(otp, user.confirmationOtp);

    if (!isValidOtp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    user.confirmed = true;
    clearOtpForField(user, "confirmationOtp");
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email confirmed successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const resendConfirmationOtp = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.confirmed) {
      return res.status(400).json({ message: "Email is already confirmed" });
    }

    await sendConfirmationOtpEmail(user);

    return res.status(200).json({
      success: true,
      message: "A new confirmation OTP has been sent to your email.",
      data: {
        email: user.email,
        requiresEmailConfirmation: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

const requestDeleteProfileOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendDeleteProfileOtpEmail(user);

    return res.status(200).json({
      success: true,
      message: "A profile deletion OTP has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.user._id).select("+deleteProfileOtp.code");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidOtp = await validateOtp(otp, user.deleteProfileOtp);

    if (!isValidOtp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  loginWithGmail,
  updatePassword,
  forgetPassword,
  resendPasswordResetOtp,
  resetPassword,
  confirmEmail,
  resendConfirmationOtp,
  requestDeleteProfileOtp,
  deleteProfile,
  getProfile,
  getUsers,
};
