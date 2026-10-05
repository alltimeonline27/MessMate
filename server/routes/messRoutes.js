const express = require("express");

const {
  getMyMess,
  updateMyMess,
} = require("../controllers/messController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Logged-in users নিজের mess-এর information দেখতে পারবে
router.get("/me", protect, getMyMess);

// শুধুমাত্র Admin নিজের mess-এর information update করতে পারবে
router.put(
  "/me",
  protect,
  adminOnly,
  updateMyMess
);

module.exports = router;