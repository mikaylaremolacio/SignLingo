const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true },
        letter: { type: String, required: true },
        level: { type: Number, required: true },
        url: { type: String, required: true },
    },
  { versionKey: false }
);

const LetterModel = mongoose.model("Letter", letterSchema, "letters");

module.exports = LetterModel;
