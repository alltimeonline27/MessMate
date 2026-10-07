const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ messId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);