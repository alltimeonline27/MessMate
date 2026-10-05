const Bazar = require("../models/Bazar");

const createBazar = async (req, res) => {
  try {
    const { date, items, amount, note } = req.body;

    if (!date || !items || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Date, items and amount are required",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative",
      });
    }

    const bazar = await Bazar.create({
      messId: req.user.messId._id,
      purchasedBy: req.user._id,
      date,
      items: items.trim(),
      amount: Number(amount),
      note: note ? note.trim() : "",
    });

    res.status(201).json({
      success: true,
      message: "Bazar entry created successfully",
      bazar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create bazar entry",
      error: error.message,
    });
  }
};

const getBazarEntries = async (req, res) => {
  try {
    const bazars = await Bazar.find({
      messId: req.user.messId._id,
    })
      .populate("purchasedBy", "name email role")
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: bazars.length,
      bazars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load bazar entries",
      error: error.message,
    });
  }
};

module.exports = {
  createBazar,
  getBazarEntries,
};