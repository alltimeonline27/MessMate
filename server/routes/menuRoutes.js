const express = require("express");

const {
  getMenu,
  updateWeeklyRoutine,
  updateDailyMenu,
  deleteDailyMenu,
} = require("../controllers/menuController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin + Member
// Get complete menu and today's effective menu
router.get("/", protect, getMenu);

// Admin only
// Update weekly routine
router.put(
  "/weekly",
  protect,
  adminOnly,
  updateWeeklyRoutine
);

// Admin only
// Create or update a daily menu override
router.put(
  "/daily",
  protect,
  adminOnly,
  updateDailyMenu
);

// Admin only
// Remove a daily menu override
router.delete(
  "/daily/:date",
  protect,
  adminOnly,
  deleteDailyMenu
);

module.exports = router;