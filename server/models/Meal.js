const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
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

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// One member can have only one actual meal entry
// for a particular date and meal type.
mealSchema.index(
  {
    messId: 1,
    member: 1,
    date: 1,
    mealType: 1,
  },
  {
    unique: true,
  }
);

const Meal = mongoose.model("Meal", mealSchema);

module.exports = Meal;