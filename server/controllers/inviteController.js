const Invite = require("../models/Invite");
const generateInviteCode = require("../utils/generateInviteCode");

const createInvite = async (req, res) => {
  try {
    const messId = req.user.messId._id;

    let inviteCode;
    let existingInvite;

    do {
      inviteCode = generateInviteCode();

      existingInvite = await Invite.findOne({
        inviteCode,
      });
    } while (existingInvite);

    // Invite will remain active for 24 hours
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const invite = await Invite.create({
      messId,
      createdBy: req.user._id,
      inviteCode,
      expiresAt,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Invite created successfully",
      invite,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create invite",
      error: error.message,
    });
  }
};

const getMyInvites = async (req, res) => {
  try {
    const invites = await Invite.find({
      messId: req.user.messId._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invites.length,
      invites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load invites",
      error: error.message,
    });
  }
};

module.exports = {
  createInvite,
  getMyInvites,
};