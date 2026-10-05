const express = require("express");

const {
  voteMeal,
  getPollVotes,
} = require("../controllers/mealVoteController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin + Member: meal poll-এ vote করবে
router.post(
  "/:pollId",
  protect,
  voteMeal
);

// Admin + Member: poll-এর vote/result দেখবে
router.get(
  "/:pollId",
  protect,
  getPollVotes
);

module.exports = router;