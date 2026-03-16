const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const User = require("../models/User");
const Flashcard = require("../models/Flashcard");

/* ===============================
   📊 ADMIN ANALYTICS
================================ */

// 🔹 Total Users
router.get("/stats/users", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users count" });
  }
});

// 🔹 Total Flashcards
router.get("/stats/flashcards", adminAuth, async (req, res) => {
  try {
    const totalFlashcards = await Flashcard.countDocuments();
    res.json({ totalFlashcards });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch flashcards count" });
  }
});

/* ===============================
   🧠 ADMIN FLASHCARD CRUD
================================ */

// 🔹 Get all flashcards
router.get("/flashcards", adminAuth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch flashcards" });
  }
});

// 🔹 Add new flashcard
router.post("/flashcards", adminAuth, async (req, res) => {
  try {
    const { word, meaning, example } = req.body;

    const flashcard = new Flashcard({
      word,
      meaning,
      example
    });

    await flashcard.save();
    res.json({ message: "Flashcard added", flashcard });
  } catch (err) {
    res.status(500).json({ message: "Failed to add flashcard" });
  }
});

// 🔹 Update flashcard
router.put("/flashcards/:id", adminAuth, async (req, res) => {
  try {
    const updated = await Flashcard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ message: "Flashcard updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update flashcard" });
  }
});

// 🔹 Delete flashcard
router.delete("/flashcards/:id", adminAuth, async (req, res) => {
  try {
    await Flashcard.findByIdAndDelete(req.params.id);
    res.json({ message: "Flashcard deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete flashcard" });
  }
});


/* ===============================
   👥 USER MANAGEMENT
================================ */

// 🔹 Get all users (without passwords)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// 🔹 Block / Unblock user
router.put("/users/:id/block", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status" });
  }
});

// 🔹 Delete user
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// 🔹 Make user admin (optional but powerful)
router.put("/users/:id/make-admin", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({ message: "User promoted to admin" });
  } catch (err) {
    res.status(500).json({ message: "Failed to promote user" });
  }
});

module.exports = router;
