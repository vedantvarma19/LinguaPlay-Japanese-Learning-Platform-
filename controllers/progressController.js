const User = require("../models/User");

/* =====================================
   MARK FLASHCARD AS KNOWN
   (BACKEND = SINGLE SOURCE OF TRUTH)
===================================== */
exports.markKnown = async (req, res) => {
  try {
    const userId = req.user.id;
    const { flashcardId } = req.body;

    if (!flashcardId) {
      return res.status(400).json({ message: "Flashcard ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Ensure array exists
    if (!user.knownFlashcards) {
      user.knownFlashcards = [];
    }

    // ✅ Avoid duplicates
    if (!user.knownFlashcards.includes(flashcardId)) {
      user.knownFlashcards.push(flashcardId);

      // ✅ Safe XP increment
      user.xp = (user.xp || 0) + 10;

      // ✅ Recalculate level
      user.level = Math.floor(user.xp / 100) + 1;
    }

    await user.save();

    res.json({
      message: "Marked as known",
      xp: user.xp,
      level: user.level,
      knownFlashcards: user.knownFlashcards,
      jlptLevel: user.jlptLevel || "N5"
    });
  } catch (error) {
    console.error("markKnown error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   GET USER PROGRESS
===================================== */
exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      xp: user.xp || 0,
      level: user.level || 1,
      knownFlashcards: user.knownFlashcards || [],
      jlptLevel: user.jlptLevel || "N5"
    });
  } catch (error) {
    console.error("getProgress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================
   SAVE USER PROGRESS
   (ONLY JLPT LEVEL – XP HANDLED ABOVE)
===================================== */
exports.saveProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jlptLevel } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Only allow JLPT level update here
    if (jlptLevel) {
      user.jlptLevel = jlptLevel;
    }

    await user.save();

    res.json({
      message: "Progress saved",
      jlptLevel: user.jlptLevel
    });
  } catch (error) {
    console.error("saveProgress error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
