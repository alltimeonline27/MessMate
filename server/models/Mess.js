const mongoose = require("mongoose");

const messSchema = new mongoose.Schema(
  {
    messId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    contact: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    paymentSettings: {
      upiId: {
        type: String,
        trim: true,
        default: "",
      },

      qrCode: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Mess = mongoose.model("Mess", messSchema);

module.exports = Mess;