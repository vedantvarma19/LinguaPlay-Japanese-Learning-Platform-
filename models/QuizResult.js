const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizResult", quizResultSchema);
