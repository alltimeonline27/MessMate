const express = require("express");

const {
  addMeal,
  getMeals,
  getMyMealHistory,
} = require("../controllers/mealController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// ADMIN: Actual Meal Entry
// =====================================================
router.get("/", protect, getMeals);

router.post("/", protect, addMeal);


// =====================================================
// MEMBER: Own Meal History
// =====================================================
router.get("/my-history", protect, getMyMealHistory);


module.exports = router;