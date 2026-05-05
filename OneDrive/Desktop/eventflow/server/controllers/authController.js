const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const emailService = require("../services/emailService");
const otpService = require("../services/otpService");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === "organizer" ? "organizer" : "user",
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch(console.error);

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await User.findByIdAndUpdate(req.user._id, {
      otp,
      otpExpire: expire,
    });

    await otpService.sendOtp(phone, otp);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select("+otp +otpExpire");

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (user.otpExpire < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: "Phone verified successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
