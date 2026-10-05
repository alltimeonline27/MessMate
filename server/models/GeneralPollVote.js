const mongoose = require("mongoose");

const generalPollVoteSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneralPoll",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    option: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const GeneralPollVote = mongoose.model(
  "GeneralPollVote",
  generalPollVoteSchema
);

module.exports = GeneralPollVote;