const MealPoll = require("../models/MealPoll");
const MealVote = require("../models/MealVote");
const Member = require("../models/Member");

const voteMeal = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { vote } = req.body;

    if (!["yes", "no"].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: "Vote must be yes or no",
      });
    }

    const poll = await MealPoll.findOne({
      _id: pollId,
      messId: req.user.messId._id,
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Meal poll not found",
      });
    }

    if (poll.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This meal poll is closed",
      });
    }

    if (new Date(poll.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Voting deadline has passed",
      });
    }

    const member = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId._id,
      status: "active",
    });

    if (!member) {
      return res.status(400).json({
        success: false,
        message:
          "You must have an active member profile to vote",
      });
    }

    const existingVote = await MealVote.findOne({
      poll: poll._id,
      member: member._id,
      messId: req.user.messId._id,
    });

    if (existingVote) {
      existingVote.vote = vote;
      await existingVote.save();

      return res.json({
        success: true,
        message: "Your meal vote has been updated",
        vote: existingVote,
      });
    }

    const mealVote = await MealVote.create({
      messId: req.user.messId._id,
      poll: poll._id,
      member: member._id,
      vote,
    });

    res.status(201).json({
      success: true,
      message: "Meal vote submitted successfully",
      vote: mealVote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit meal vote",
      error: error.message,
    });
  }
};

const getPollVotes = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await MealPoll.findOne({
      _id: pollId,
      messId: req.user.messId._id,
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Meal poll not found",
      });
    }

    const votes = await MealVote.find({
      poll: poll._id,
      messId: req.user.messId._id,
    })
      .populate(
        "member",
        "name email phone roomNumber"
      )
      .sort({ createdAt: -1 });

    const yesVotes = votes.filter(
      (item) => item.vote === "yes"
    ).length;

    const noVotes = votes.filter(
      (item) => item.vote === "no"
    ).length;

    const myMember = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId._id,
      status: "active",
    });

    const myVote = myMember
      ? votes.find(
          (item) =>
            String(item.member?._id) ===
            String(myMember._id)
        )
      : null;

    res.json({
      success: true,
      pollId: poll._id,
      yesVotes,
      noVotes,
      totalVotes: votes.length,
      myVote: myVote ? myVote.vote : null,
      votes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load poll votes",
      error: error.message,
    });
  }
};

module.exports = {
  voteMeal,
  getPollVotes,
};