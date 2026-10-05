const express = require("express");

const {
  getMembers,
  getMemberById,
  addMember,
  promoteMember,
  demoteAdmin,
} = require("../controllers/memberController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
  validateMember,
} = require("../validators/memberValidator");

const router = express.Router();

// Logged-in users নিজের mess-এর members দেখতে পারবে
router.get("/", protect, getMembers);

// শুধুমাত্র Admin member add করতে পারবে
router.post(
  "/",
  protect,
  adminOnly,
  validateMember,
  addMember
);

// Logged-in user নিজের mess-এর একটি member-এর details দেখতে পারবে
router.get(
  "/:memberId",
  protect,
  getMemberById
);

// Admin একটি normal member-কে Admin করতে পারবে
router.put(
  "/:userId/promote",
  protect,
  adminOnly,
  promoteMember
);

// Admin একটি Admin-কে Member করতে পারবে
router.put(
  "/:userId/demote",
  protect,
  adminOnly,
  demoteAdmin
);

module.exports = router;