const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        /* =====================
           BASIC USER INFO
        ====================== */
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'is invalid'] // Basic regex check
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        /* =====================
           LEARNING PROGRESS
        ====================== */
        xp: {
            type: Number,
            default: 0
        },

        level: {
            type: Number,
            default: 1
        },

        jlptLevel: {
            type: String,
            default: "N5"
        },

        knownFlashcards: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Flashcard"
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
