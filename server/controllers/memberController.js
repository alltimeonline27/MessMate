const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Member = require("../models/Member");

const getMembers = async (req, res) => {
  try {
    const members = await Member.find({
      messId: req.user.messId._id,
    })
      .populate("userId", "name email role isActive")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message,
    });
  }
};

const addMember = async (req, res) => {
  try {
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

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "member",
      messId: req.user.messId._id,
    });

    const member = await Member.create({
      userId: user._id,
      messId: req.user.messId._id,
      name,
      email,
      phone,
      roomNumber,
    });

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

const promoteMember = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findOne({
      _id: userId,
      messId: req.user.messId._id,
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Member not found in your mess",
      });
    }

    if (targetUser.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "This user is already an admin",
      });
    }

    if (targetUser.role !== "member") {
      return res.status(400).json({
        success: false,
        message: "Only a normal member can be promoted",
      });
    }

    targetUser.role = "admin";

    await targetUser.save();

    res.json({
      success: true,
      message: "Member promoted to admin successfully",
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to promote member",
      error: error.message,
    });
  }
};

const demoteAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findOne({
      _id: userId,
      messId: req.user.messId._id,
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in your mess",
      });
    }

    if (targetUser.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "This user is not an admin",
      });
    }

    // Count active admins in this mess
    const adminCount = await User.countDocuments({
      messId: req.user.messId._id,
      role: "admin",
      isActive: true,
    });

    // Only one admin exists
    if (adminCount <= 1) {
      // The only admin is trying to demote themselves
      if (String(targetUser._id) === String(req.user._id)) {
        return res.status(400).json({
          success: false,
          message:
            "You are the only admin. Promote another member to admin before demoting yourself.",
        });
      }

      // Safety fallback for another admin
      return res.status(400).json({
        success: false,
        message:
          "The last admin cannot be demoted. Promote another member to admin first.",
      });
    }

    // More than one admin exists, so demotion is allowed
    targetUser.role = "member";

    await targetUser.save();

    res.json({
      success: true,
      message: "Admin demoted to member successfully",
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to demote admin",
      error: error.message,
    });
  }
};

const getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findOne({
      _id: memberId,
      messId: req.user.messId._id,
    }).populate(
      "userId",
      "name email role isActive"
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found in your mess",
      });
    }

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch member details",
      error: error.message,
    });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  addMember,
  promoteMember,
  demoteAdmin,
};