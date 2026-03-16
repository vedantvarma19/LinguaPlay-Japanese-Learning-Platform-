const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  addFlashcard,
  getAllFlashcards,
  updateFlashcard,
  deleteFlashcard,
} = require("../controllers/adminController");

// 🔒 ADMIN FLASHCARD CRUD
router.get(
  "/flashcards",
  authMiddleware,
  adminMiddleware,
  getAllFlashcards
);

router.post(
  "/flashcards",
  authMiddleware,
  adminMiddleware,
  addFlashcard
);

router.put(
  "/flashcards/:id",
  authMiddleware,
  adminMiddleware,
  updateFlashcard
);

router.delete(
  "/flashcards/:id",
  authMiddleware,
  adminMiddleware,
  deleteFlashcard
);

module.exports = router;
