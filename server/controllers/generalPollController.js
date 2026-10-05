const GeneralPoll = require("../models/GeneralPoll");

const createGeneralPoll = async (req, res) => {
  try {
    const {
      question,
      options,
      deadline,
    } = req.body;

    if (!question || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Question and deadline are required",
      });
    }

    if (
      !Array.isArray(options) ||
      options.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least 2 poll options are required",
      });
    }

    const cleanedOptions = options
      .map((option) => String(option).trim())
      .filter((option) => option.length > 0);

    if (cleanedOptions.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "At least 2 valid poll options are required",
      });
    }

    const poll = await GeneralPoll.create({
      messId: req.user.messId._id,
      question: question.trim(),
      options: cleanedOptions,
      createdBy: req.user._id,
      deadline,
      status: "open",
    });

    res.status(201).json({
      success: true,
      message: "General poll created successfully",
      poll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create general poll",
      error: error.message,
    });
  }
};

const getGeneralPolls = async (req, res) => {
  try {
    const polls = await GeneralPoll.find({
      messId: req.user.messId._id,
    })
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
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
      message: "Failed to load general polls",
      error: error.message,
    });
  }
};

module.exports = {
  createGeneralPoll,
  getGeneralPolls,
};