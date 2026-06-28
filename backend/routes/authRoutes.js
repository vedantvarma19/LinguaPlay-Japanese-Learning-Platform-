const express = require("express");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { 
  register, 
  login, 
  sendOtp, 
  verifyOtp, 
  googleLogin, 
  getProfile, 
  updateProfile 
} = require("../controllers/authController");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: "Too many login attempts. Try again later."
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: { message: "Too many accounts created. Try again later." }
});

// AUTH ROUTES (FIXED - no duplicate routes)
router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

// MOCK AUTH & OTP SIGNUP
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google-login", googleLogin);

// USER PROFILE MANAGEMENT
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
