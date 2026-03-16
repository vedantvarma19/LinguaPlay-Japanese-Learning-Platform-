const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  language: {
    type: String,
    default: "japanese"
  },
  jlptLevel: {
    type: String,
    default: "N5"
  },
  xp: {
    type: Number,
    default: 0
  },
  knownWords: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flashcard"
    }
  ]
});

module.exports = mongoose.model("UserProgress", userProgressSchema);
