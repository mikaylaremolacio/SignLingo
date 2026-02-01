const mongoose = require("mongoose");

const LetterProgressSchema = new mongoose.Schema(
  {
    letter: {
      type: String,
      required: true,
    },

    level: {
      type: Number,
      required: true,
    },

    review: {
      interval: {
        type: Number,
        default: 1,
      },
      easeFactor: {
        type: Number,
        default: 2.5,
        min: 1.3,
      },
      repetitions: {
        type: Number,
        default: 0,
      },

      nextReviewAt: {
        type: Date,
        required: true,
      },
      lastReviewedAt: {
        type: Date,
        default: null,
      },

      correctReviews: {
        type: Number,
        default: 0,
      },
      incorrectReviews: {
        type: Number,
        default: 0,
      },
    },
  },
  { _id: false }
);

const ProgressSchema = new mongoose.Schema(
  {

    username: {
      type: String,
      ref: "user",
      required: true,
      unique: true,
    },

    level: {
      type: Number,
      required: true,
    },

    letters: {
      type: [LetterProgressSchema],
      required: true,
    },
  },
  { timestamps: true }
);

ProgressSchema.index({ "letters.review.nextReviewAt": 1 });

const ProgressModel = mongoose.model(
  "Progress",
  ProgressSchema,
  "progress"
);

module.exports = ProgressModel;
