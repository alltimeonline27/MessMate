const express = require("express");

const {
  createInvite,
  getMyInvites,
} = require("../controllers/inviteController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Admin নতুন invite তৈরি করতে পারবে
router.post(
  "/",
  protect,
  adminOnly,
  createInvite
);

// Admin নিজের mess-এর invite list দেখতে পারবে
router.get(
  "/",
  protect,
  adminOnly,
  getMyInvites
);

module.exports = router;