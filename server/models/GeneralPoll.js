const mongoose = require("mongoose");

const generalPollSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const GeneralPoll = mongoose.model(
  "GeneralPoll",
  generalPollSchema
);

module.exports = GeneralPoll;