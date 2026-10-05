const express = require("express");

const {
  addExpense,
  getExpenses,
  getExpenseSummary,
  deleteExpense,
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// =====================================================
// GET ALL EXPENSES
// Admin + Member
// =====================================================

router.get(
  "/",
  protect,
  getExpenses
);

// =====================================================
// GET EXPENSE SUMMARY
// Admin + Member
// =====================================================

router.get(
  "/summary",
  protect,
  getExpenseSummary
);

// =====================================================
// ADD EXPENSE
// Admin only
// =====================================================

router.post(
  "/",
  protect,
  adminOnly,
  addExpense
);

// =====================================================
// DELETE EXPENSE
// Admin only
// =====================================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteExpense
);

module.exports = router;