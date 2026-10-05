const Expense = require("../models/Expense");

// =====================================================
// ADD OTHER EXPENSE
// Admin only
// =====================================================

const addExpense = async (req, res) => {
  try {
    const {
      date,
      category,
      description,
      amount,
      note,
    } = req.body;

    if (
      !date ||
      !category ||
      !description ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date, category, description and amount are required",
      });
    }

    const expense = await Expense.create({
      messId: req.user.messId._id,
      addedBy: req.user._id,
      date,
      category,
      description,
      amount,
      note: note || "",
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error(
      "Add expense error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to add expense",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL OTHER EXPENSES
// Same mess only
// =====================================================

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      messId: req.user.messId._id,
    })
      .populate(
        "addedBy",
        "name email role"
      )
      .sort({
        date: -1,
        createdAt: -1,
      });

    const totalExpense = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    res.json({
      success: true,
      expenses,
      totalExpense,
    });
  } catch (error) {
    console.error(
      "Get expenses error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load expenses",
      error: error.message,
    });
  }
};

// =====================================================
// GET EXPENSE SUMMARY
// =====================================================

const getExpenseSummary = async (
  req,
  res
) => {
  try {
    const expenses = await Expense.find({
      messId: req.user.messId._id,
    });

    const totalExpense = expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    const categoryTotals = {};

    expenses.forEach((expense) => {
      const category =
        expense.category;

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }

      categoryTotals[category] += Number(
        expense.amount || 0
      );
    });

    res.json({
      success: true,
      totalExpense,
      categoryTotals,
    });
  } catch (error) {
    console.error(
      "Expense summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load expense summary",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE EXPENSE
// Admin only
// =====================================================

const deleteExpense = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const expense =
      await Expense.findOne({
        _id: id,
        messId: req.user.messId._id,
      });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

    res.json({
      success: true,
      message:
        "Expense deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete expense error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete expense",
      error: error.message,
    });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseSummary,
  deleteExpense,
};