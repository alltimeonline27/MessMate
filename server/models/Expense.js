const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "gas",
        "electricity",
        "rent",
        "maintenance",
        "water",
        "cleaning",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model(
  "Expense",
  expenseSchema
);

module.exports = Expense;