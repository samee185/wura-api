const Users = require("../models/user");
const bcrypt = require("bcrypt");
const signJwt = require("../utils/signJwt");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const blackListModel = require("../models/blacklistToken");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// Utility: strip sensitive fields
function sanitizeUser(user) {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.verification_token;
  delete userObj.reset_password_token;
  return userObj;
}

// ========== SIGNUP ==========
// const signup = asyncHandler(async (req, res, next) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const validation = validateUserSignup(req.body);
//     if (validation?.error) throw new AppError(validation.error.message, 400);

//     const { firstName, lastName, email, password } = req.body;

//     const existingUser = await Users.findOne({ email }).session(session);
//     if (existingUser) throw new AppError("Email already in use", 400);

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const [createdUser] = await Users.create(
//       [{ firstName, lastName, email, password: hashedPassword }],
//       { session }
//     );
//     if (!createdUser) throw new AppError("Failed to create user account", 500);

//     await sendEmail({
//       email,
//       subject: "Welcome to Skinish!",
//       template: "welcome",
//       data: { firstName, ctaUrl: process.env.CLIENT_URL || "https://skinish.com" },
//     });

//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = await bcrypt.hash(verificationToken, 10);
//     createdUser.verification_token = hashedToken;
//     createdUser.verification_token_expires = Date.now() + 24 * 60 * 60 * 1000;

//     const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify/${createdUser.email}/${verificationToken}`;
//     await sendEmail({
//       email,
//       subject: "Verify your Skinish account",
//       template: "verifyAccount",
//       data: { firstName, verificationUrl },
//     });

//     await createdUser.save({ session });
//     await session.commitTransaction();

//     const token = signJwt(createdUser._id);
//     res.status(201).json({
//       status: "success",
//       data: { user: sanitizeUser(createdUser), token },
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     next(err);
//   } finally {
//     session.endSession();
//   }
// });

// ========== CREATE ADMIN USER ==========
const createAdminUser = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new AppError("All fields are required", 400);   
    }

    const existingUser = await Users.findOne({ email }).session(session);
    if (existingUser) throw new AppError("User already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 12);
    const [adminUser] = await Users.create(
      [{
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "admin",
      }],
      { session }
    );
    if (!adminUser) throw new AppError("Failed to create admin", 500);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(verificationToken, 12);
    adminUser.verification_token = hashedToken;
    adminUser.verification_token_expires = Date.now() + 24 * 60 * 60 * 1000;

    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify/${adminUser.email}/${verificationToken}`;
    const ctaUrl = "https://wuragold-admin.vercel.app";

    await Promise.all([
      sendEmail({
        email,
        subject: "Welcome to Wuragold Admin",
        template: "welcomeAdmin",
        data: { firstName, lastName, ctaUrl },
      }),
      // sendEmail({
      //   email,
      //   subject: "Verify your email address",
      //   template: "verifyAccount",
      //   data: { firstName, verificationUrl },
      // }),
      adminUser.save({ session }),
    ]);

    await session.commitTransaction();
    const token = signJwt(adminUser._id);
    res.status(201).json({
      status: "success",
      message: "Admin created successfully",
      data: { adminUser: sanitizeUser(adminUser), token },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

// ========== LOGIN ==========
// const login = asyncHandler(async (req, res, next) => {
//   const validation = validateUserLogin(req.body);
//   if (validation?.error) throw new AppError(validation.error.message, 400);

//   const { email, password } = req.body;
//   const user = await Users.findOne({ email }).select("+password");
//   if (!user || !(await user.comparePassword(password, user.password))) {
//     throw new AppError("Invalid email or password", 401);
//   }

//   const token = signJwt(user._id);
//   res.status(200).json({
//     status: "success",
//     message: "Login successful",
//     data: { user: sanitizeUser(user), token },
//   });
// });

// ========== ADMIN LOGIN ==========
const logInAdmin = asyncHandler(async (req, res, next) => {
  const validation = validateUserLogin(req.body);
  if (validation?.error) throw new AppError(validation.error.message, 400);

  const { email, password } = req.body;
  const admin = await Users.findOne({ email, role: "admin" }).select("+password");

  
  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signJwt(admin._id);
  res.status(200).json({
    status: "success",
    message: "Admin logged in successfully",
    data: { adminUser: sanitizeUser(admin), token },
  });
});

// ========== VERIFY EMAIL ==========
const verifyEmailAddress = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, verificationToken } = req.params;

    const user = await Users.findOne({ email }).session(session);
    if (!user) throw new AppError("User not found", 404);

    if (user.verification_token_expires < Date.now()) {
      throw new AppError("Verification token expired", 400);
    }

    const isValid = await bcrypt.compare(verificationToken, user.verification_token);
    if (!isValid) throw new AppError("Invalid token", 400);

    user.email_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;

    await user.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      message: "Email verified",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

// ========== FORGOT PASSWORD ==========
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new AppError("Please provide email", 400);

  const user = await Users.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);

  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/resetpassword/${email}/${resetToken}`;
  await sendEmail({
    email,
    subject: "Reset Your Wuragold Password",
    template: "passwordReset",
    data: { firstName: user.firstName, resetUrl },
  });

  user.reset_password_token = hashedToken;
  user.reset_password_expires = Date.now() + 60 * 60 * 1000; // 1hr
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Reset link sent",
  });
});

// ========== RESET PASSWORD ==========
const resetPassword = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    if (!email || !resetToken || !password || !confirmPassword) {
      throw new AppError("All fields required", 400);
    }
    if (password !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const user = await Users.findOne({ email }).session(session);
    if (!user) throw new AppError("User not found", 404);
    if (user.reset_password_expires < Date.now()) {
      throw new AppError("Reset token expired", 400);
    }

    const isValid = await bcrypt.compare(resetToken, user.reset_password_token);
    if (!isValid) throw new AppError("Invalid reset token", 400);

    user.password = await bcrypt.hash(password, 10);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;

    await user.save({ session });
    await session.commitTransaction();

    await sendEmail({
      email: user.email,
      subject: "Your Skinish Password Was Reset",
      template: "passwordResetConfirmation",
      data: { firstName: user.firstName },
    });

    res.status(200).json({ status: "success", message: "Password reset" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

// ========== LOGOUT ==========
const logOut = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ status: "error", message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  await blackListModel.create({ token });

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

module.exports = {
  // signup,
  createAdminUser,
  // login,
  logInAdmin,
  verifyEmailAddress,
  forgotPassword,
  resetPassword,
  logOut,
};
