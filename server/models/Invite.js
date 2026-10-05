const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inviteCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "used", "expired", "disabled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Invite = mongoose.model("Invite", inviteSchema);

module.exports = Invite;