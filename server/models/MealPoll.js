const mongoose = require("mongoose");

const mealPollSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    mealType: {
      type: String,
      enum: ["lunch", "dinner"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    deadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MealPoll = mongoose.model("MealPoll", mealPollSchema);

module.exports = MealPoll;