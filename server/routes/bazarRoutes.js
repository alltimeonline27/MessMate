const express = require("express");

const {
  createBazar,
  getBazarEntries,
} = require("../controllers/bazarController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin can add bazar entry
router.post("/", protect, adminOnly, createBazar);

// Admin + Member can view bazar entries
router.get("/", protect, getBazarEntries);

module.exports = router;