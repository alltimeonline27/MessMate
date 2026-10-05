const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Logged-in user নিজের profile দেখতে পারবে
router.get("/me", protect, getMyProfile);

// Logged-in user নিজের profile update করতে পারবে
router.put("/me", protect, updateMyProfile);

module.exports = router;