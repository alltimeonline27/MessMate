const express = require("express");

const {
  getInviteDetails,
  createJoinRequest,
  getJoinRequests,
  reviewJoinRequest,
} = require("../controllers/joinRequestController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Public: নতুন member invite link খুললে mess information দেখবে
router.get(
  "/invite/:inviteCode",
  getInviteDetails
);

// Public: নতুন member join request পাঠাবে
router.post(
  "/:inviteCode",
  createJoinRequest
);

// Admin: নিজের mess-এর join requests দেখবে
router.get(
  "/",
  protect,
  adminOnly,
  getJoinRequests
);

// Admin: join request accept/reject করবে
router.put(
  "/:requestId/review",
  protect,
  adminOnly,
  reviewJoinRequest
);

module.exports = router;