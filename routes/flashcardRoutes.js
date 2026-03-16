const express = require("express");
const router = express.Router();
const Flashcard = require("../models/Flashcard");

// ✅ Get flashcards by language + JLPT level
// Example: /api/flashcards/japanese/N5
router.get("/japanese/:level", async (req, res) => {
  try {
    const level = req.params.level.toUpperCase();
    // Validate JLPT level
    const validLevels = ["N5", "N4", "N3", "N2", "N1"];
    if (!validLevels.includes(level)) {
      return res.status(400).json({ message: "Invalid JLPT level" });
    }

    const flashcards = await Flashcard.find({
      language: "Japanese",
      level: level
    });

    res.json(flashcards);
  } catch (error) {
    console.error("Fetch flashcards error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
