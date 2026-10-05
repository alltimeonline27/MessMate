const mongoose = require("mongoose");

const bazarScheduleSchema = new mongoose.Schema(
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

    assignedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true,
      },
    ],

    note: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isManualOverride: {
      type: Boolean,
      default: false,
    },

    sourceDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const BazarSchedule = mongoose.model(
  "BazarSchedule",
  bazarScheduleSchema
);

module.exports = BazarSchedule;