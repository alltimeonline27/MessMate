const GeneralPoll = require("../models/GeneralPoll");
const GeneralPollVote = require("../models/GeneralPollVote");

const voteGeneralPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { option } = req.body;

    if (!option || !option.trim()) {
      return res.status(400).json({
        success: false,
        message: "Poll option is required",
      });
    }

    const poll = await GeneralPoll.findOne({
      _id: pollId,
      messId: req.user.messId._id,
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "General poll not found",
      });
    }

    if (poll.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This poll is closed",
      });
    }

    if (new Date(poll.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Voting deadline has passed",
      });
    }

    const selectedOption = option.trim();

    const validOption = poll.options.some(
      (pollOption) => pollOption === selectedOption
    );

    if (!validOption) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll option",
      });
    }

    const existingVote = await GeneralPollVote.findOne({
      poll: poll._id,
      user: req.user._id,
      messId: req.user.messId._id,
    });

    if (existingVote) {
      existingVote.option = selectedOption;

      await existingVote.save();

      return res.json({
        success: true,
        message: "Your poll vote has been updated",
        vote: existingVote,
      });
    }

    const vote = await GeneralPollVote.create({
      messId: req.user.messId._id,
      poll: poll._id,
      user: req.user._id,
      option: selectedOption,
    });

    res.status(201).json({
      success: true,
      message: "Poll vote submitted successfully",
      vote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit poll vote",
      error: error.message,
    });
  }
};

const getGeneralPollVotes = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await GeneralPoll.findOne({
      _id: pollId,
      messId: req.user.messId._id,
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "General poll not found",
      });
    }

    const votes = await GeneralPollVote.find({
      poll: poll._id,
      messId: req.user.messId._id,
    }).populate(
      "user",
      "name email role"
    );

    const results = poll.options.map(
      (pollOption) => ({
        option: pollOption,
        votes: votes.filter(
          (vote) =>
            vote.option === pollOption
        ).length,
      })
    );

    const myVote = votes.find(
      (vote) =>
        String(vote.user?._id) ===
        String(req.user._id)
    );

    res.json({
      success: true,
      pollId: poll._id,
      totalVotes: votes.length,
      results,
      myVote: myVote
        ? myVote.option
        : null,
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
  voteGeneralPoll,
  getGeneralPollVotes,
};