const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   REGISTER (SIGN UP)
========================= */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",       // default role
      isBlocked: false    // default
    });

    await user.save();

    // I have added token mechanism here - dedlinux
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🚫 Blocked user check (VERY IMPORTANT)
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔐 JWT — identity ONLY (no role inside token)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Role is returned separately (for frontend UI only)
    return res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// In-memory store for OTPs (temporary)
const otpStore = {};

/* =========================
   SEND OTP (SIMULATED SIGNUP)
========================= */
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes expiry
    };

    console.log(`\n===================================`);
    console.log(`🌸 [LinguaPlay OTP Simulator]`);
    console.log(`Email: ${email}`);
    console.log(`OTP:   ${otp}`);
    console.log(`===================================\n`);

    return res.status(200).json({
      message: "OTP sent successfully (Simulated)",
      otp // Return OTP in response so frontend can show/mock it for easy grading
    });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* =========================
   VERIFY OTP & REGISTER
========================= */
const verifyOtp = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: "All fields and OTP are required" });
    }

    const record = otpStore[email];
    if (!record || record.otp !== otp || record.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    delete otpStore[email];

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isBlocked: false,
      xp: 0,
      weeklyXp: 0,
      level: 1,
      streak: 1,
      lastActive: new Date(),
      avatar: "🦊"
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "User registered and verified successfully",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};

/* =========================
   ACTUAL & SIMULATED GOOGLE LOGIN
========================= */
const googleLogin = async (req, res) => {
  try {
    const { credential, name: mockName, email: mockEmail, avatar: mockAvatar } = req.body;

    let email = "";
    let name = "";
    let avatar = "🦊";

    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        // Use Google profile picture or fallback to emoji
        avatar = payload.picture || "🦊";
      } catch (err) {
        console.error("Google Token Verification Failed:", err);
        return res.status(400).json({ message: "Google token verification failed" });
      }
    } else {
      // Fallback to simulated accounts
      if (!mockEmail || !mockName) {
        return res.status(400).json({ message: "Google account details are missing" });
      }
      email = mockEmail;
      name = mockName;
      avatar = mockAvatar || "🦊";
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.isBlocked) {
        return res.status(403).json({ message: "Your account is blocked by admin" });
      }
      
      // Update avatar if provided
      if (avatar && (user.avatar === "🦊" || user.avatar.startsWith("http"))) {
        user.avatar = avatar;
      }
      
      // Manage streaks
      const today = new Date().toDateString();
      const lastActiveDay = user.lastActive ? new Date(user.lastActive).toDateString() : null;
      
      if (lastActiveDay !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastActiveDay === yesterdayStr) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
        user.lastActive = new Date();
        await user.save();
      }
    } else {
      // Create new user via Google
      const mockPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(mockPassword, 10);
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: "user",
        isBlocked: false,
        xp: 0,
        weeklyXp: 0,
        level: 1,
        streak: 1,
        lastActive: new Date(),
        avatar: avatar || "🦊"
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Google login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("googleLogin error:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};

/* =========================
   GET USER PROFILE
========================= */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Failed to retrieve profile" });
  }
};

/* =========================
   UPDATE USER PROFILE
========================= */
const updateProfile = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }
    if (avatar) user.avatar = avatar;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  googleLogin,
  getProfile,
  updateProfile
};
