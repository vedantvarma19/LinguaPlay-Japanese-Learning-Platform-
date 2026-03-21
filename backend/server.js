const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

require("dotenv").config();

// ROUTES
const authRoutes = require("./routes/authRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ERROR HANDLER
const errorHandler = require("./middleware/errorHandler");

const app = express();

// =====================
// MIDDLEWARE
// =====================

// CORS Configuration - secure for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// =====================
// ROUTE CONNECTIONS
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);

// =====================
// HEALTH CHECK ROUTE
// =====================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "LinguaPlay Backend Running",
    timestamp: new Date().toISOString()
  });
});

// =====================
// ERROR HANDLER (Must be after routes)
// =====================
app.use(errorHandler);

// =====================
// DATABASE & SERVER START
// =====================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/linguaplay";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
