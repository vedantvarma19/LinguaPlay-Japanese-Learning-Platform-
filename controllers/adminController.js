const Flashcard = require("../models/Flashcard");

// ➕ ADD FLASHCARD
exports.addFlashcard = async (req, res) => {
  try {
    const { word, meaning, category } = req.body;

    if (!word || !meaning) {
      return res.status(400).json({ message: "Word and meaning required" });
    }

    const flashcard = new Flashcard({
      word,
      meaning,
      category,
    });

    await flashcard.save();

    res.status(201).json(flashcard);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📄 GET ALL FLASHCARDS (ADMIN)
exports.getAllFlashcards = async (req, res) => {
  try {
    const cards = await Flashcard.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✏️ UPDATE FLASHCARD
exports.updateFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Flashcard.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ DELETE FLASHCARD
exports.deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    await Flashcard.findByIdAndDelete(id);
    res.json({ message: "Flashcard deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
