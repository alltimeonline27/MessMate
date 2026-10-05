const bcrypt = require("bcryptjs");

const Invite = require("../models/Invite");
const Mess = require("../models/Mess");
const JoinRequest = require("../models/JoinRequest");
const User = require("../models/User");
const Member = require("../models/Member");

const getInviteDetails = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const invite = await Invite.findOne({
      inviteCode,
    }).populate("messId", "messId name address status");

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invite not found",
      });
    }

    if (invite.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This invite is no longer active",
      });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = "expired";
      await invite.save();

      return res.status(400).json({
        success: false,
        message: "This invite has expired",
      });
    }

    if (!invite.messId) {
      return res.status(404).json({
        success: false,
        message: "Mess not found",
      });
    }

    if (invite.messId.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This mess is inactive",
      });
    }

    res.json({
      success: true,
      mess: invite.messId,
      inviteCode: invite.inviteCode,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load invite",
      error: error.message,
    });
  }
};

const createJoinRequest = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const {
      name,
      email,
      password,
      phone,
      roomNumber,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !roomNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password, phone and room number are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const invite = await Invite.findOne({
      inviteCode,
      status: "active",
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive invite",
      });
    }

    if (new Date(invite.expiresAt) < new Date()) {
      invite.status = "expired";
      await invite.save();

      return res.status(400).json({
        success: false,
        message: "This invite has expired",
      });
    }

    const mess = await Mess.findById(
      invite.messId
    );

    if (!mess || mess.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This mess is inactive",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const existingRequest =
      await JoinRequest.findOne({
        messId: invite.messId,
        email: normalizedEmail,
        status: "pending",
      });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending join request",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const joinRequest = await JoinRequest.create({
      messId: invite.messId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      roomNumber: roomNumber.trim(),
      password: hashedPassword,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        "Join request sent successfully. Please wait for admin approval.",
      requestId: joinRequest._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send join request",
      error: error.message,
    });
  }
};

const getJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({
      messId: req.user.messId._id,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load join requests",
      error: error.message,
    });
  }
};

const reviewJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be accept or reject",
      });
    }

    const joinRequest = await JoinRequest.findOne({
      _id: requestId,
      messId: req.user.messId._id,
      status: "pending",
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        message: "Pending join request not found",
      });
    }

    if (action === "reject") {
      joinRequest.status = "rejected";
      joinRequest.reviewedBy = req.user._id;
      joinRequest.reviewedAt = new Date();

      await joinRequest.save();

      return res.json({
        success: true,
        message: "Join request rejected successfully",
      });
    }

    const existingUser = await User.findOne({
      email: joinRequest.email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name: joinRequest.name,
      email: joinRequest.email,
      password: joinRequest.password,
      role: "member",
      messId: joinRequest.messId,
      isActive: true,
    });

    await Member.create({
      userId: user._id,
      messId: joinRequest.messId,
      name: joinRequest.name,
      email: joinRequest.email,
      phone: joinRequest.phone,
      roomNumber: joinRequest.roomNumber,
      status: "active",
    });

    joinRequest.status = "accepted";
    joinRequest.reviewedBy = req.user._id;
    joinRequest.reviewedAt = new Date();

    await joinRequest.save();

    res.json({
      success: true,
      message: "Join request accepted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to review join request",
      error: error.message,
    });
  }
};

module.exports = {
  getInviteDetails,
  createJoinRequest,
  getJoinRequests,
  reviewJoinRequest,
};