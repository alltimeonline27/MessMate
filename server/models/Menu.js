const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    // Weekly routine
    weeklyRoutine: {
      monday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },

      tuesday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },

      wednesday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },

      thursday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },

      friday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },

      saturday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },

      sunday: {
        breakfast: { type: String, default: "" },
        lunch: { type: String, default: "" },
        dinner: { type: String, default: "" },
      },
    },

    // Daily menu override
    dailyOverrides: [
      {
        date: {
          type: Date,
          required: true,
        },

        breakfast: {
          type: String,
          default: "",
        },

        lunch: {
          type: String,
          default: "",
        },

        dinner: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;