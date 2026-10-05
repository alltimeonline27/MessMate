const express = require("express");

const {
  voteGeneralPoll,
  getGeneralPollVotes,
} = require("../controllers/generalPollVoteController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin + Member: General Poll-এ vote করবে
router.post(
  "/:pollId",
  protect,
  voteGeneralPoll
);

// Admin + Member: Poll result দেখবে
router.get(
  "/:pollId",
  protect,
  getGeneralPollVotes
);

module.exports = router;