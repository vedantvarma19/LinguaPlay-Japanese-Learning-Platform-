const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

// ROUTES
const authRoutes = require("./routes/authRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const progressRoutes = require("./routes/progressRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ admin routes

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    message: "Too many requests. Please try again later."
  }
});

app.use(globalLimiter);


// =====================
// ROUTE CONNECTIONS
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);


// =====================
// TEST ROUTE
// =====================
app.get("/", (req, res) => {
  res.send("LinguaPlay Backend Running");
});


mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/linguaplay")
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));

  const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);
