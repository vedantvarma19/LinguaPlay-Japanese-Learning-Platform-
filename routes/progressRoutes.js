const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  markKnown,
  getProgress,
  saveProgress
} = require("../controllers/progressController");

const progressLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    message: "Too many actions. Slow down."
  }
});


router.get("/", authMiddleware, getProgress);
router.post("/", authMiddleware, progressLimiter, saveProgress);
router.post("/known", authMiddleware, progressLimiter, markKnown);


module.exports = router;
