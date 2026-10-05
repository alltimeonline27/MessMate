const express = require("express");

const {
  createGeneralPoll,
  getGeneralPolls,
} = require("../controllers/generalPollController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin: General Poll তৈরি করবে
router.post(
  "/",
  protect,
  adminOnly,
  createGeneralPoll
);

// Admin + Member: নিজের mess-এর General Poll দেখবে
router.get(
  "/",
  protect,
  getGeneralPolls
);

module.exports = router;