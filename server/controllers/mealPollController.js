const MealPoll = require("../models/MealPoll");

const createMealPoll = async (req, res) => {
  try {
    const {
      date,
      mealType,
      deadline,
    } = req.body;

    if (!date || !mealType || !deadline) {
      return res.status(400).json({
        success: false,
        message:
          "Date, meal type and deadline are required",
      });
    }

    if (!["lunch", "dinner"].includes(mealType)) {
      return res.status(400).json({
        success: false,
        message:
          "Meal type must be lunch or dinner",
      });
    }

    const poll = await MealPoll.create({
      messId: req.user.messId._id,
      date,
      mealType,
      createdBy: req.user._id,
      deadline,
      status: "open",
    });

    res.status(201).json({
      success: true,
      message: "Meal poll created successfully",
      poll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create meal poll",
      error: error.message,
    });
  }
};

const getMealPolls = async (req, res) => {
  try {
    const polls = await MealPoll.find({
      messId: req.user.messId._id,
    })
      .populate("createdBy", "name email role")
      .sort({
        date: -1,
        createdAt: -1,
      });

    res.json({
      success: true,
      count: polls.length,
      polls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load meal polls",
      error: error.message,
    });
  }
};

module.exports = {
  createMealPoll,
  getMealPolls,
};