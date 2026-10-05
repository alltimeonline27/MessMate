const mongoose = require("mongoose");

const mealVoteSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MealPoll",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    vote: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MealVote = mongoose.model("MealVote", mealVoteSchema);

module.exports = MealVote;