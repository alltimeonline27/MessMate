const express = require("express");

const {
  createBazarSchedule,
  getBazarSchedules,
  createMonthlyBazarSchedule,
  generateNextMonthBazarSchedule,
} = require("../controllers/bazarScheduleController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin can create one day's bazar schedule
router.post("/", protect, adminOnly, createBazarSchedule);

// Admin + Member can view bazar schedules
router.get("/", protect, getBazarSchedules);

// Admin can create/update a full month's schedule
router.post(
  "/monthly",
  protect,
  adminOnly,
  createMonthlyBazarSchedule
);

// Admin can automatically generate next month's schedule
router.post(
  "/generate-next-month",
  protect,
  adminOnly,
  generateNextMonthBazarSchedule
);

module.exports = router;