const express = require("express");

const {
  createMealPoll,
  getMealPolls,
} = require("../controllers/mealPollController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin: নতুন meal poll তৈরি করবে
router.post(
  "/",
  protect,
  adminOnly,
  createMealPoll
);

// Logged-in users: নিজের mess-এর meal polls দেখবে
router.get(
  "/",
  protect,
  getMealPolls
);

module.exports = router;