const User = require("../models/User");
const Member = require("../models/Member");

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("messId", "messId name status");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const member = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId?._id,
    });

    res.json({
      success: true,
      user,
      member: member || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load profile",
      error: error.message,
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, roomNumber } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update User information
    if (name) {
      user.name = name;
    }

    await user.save();

    // Find existing Member profile
    let member = await Member.findOne({
      userId: req.user._id,
      messId: req.user.messId?._id,
    });

    // If Member profile does not exist,
    // create one when phone and room number are provided
    if (!member) {
      if (!phone || !roomNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Phone and room number are required to create your member profile",
        });
      }

      member = await Member.create({
        userId: req.user._id,
        messId: req.user.messId._id,
        name: user.name,
        email: user.email,
        phone,
        roomNumber,
      });
    } else {
      // Update existing Member profile
      if (name) {
        member.name = name;
      }

      if (phone !== undefined) {
        member.phone = phone;
      }

      if (roomNumber !== undefined) {
        member.roomNumber = roomNumber;
      }

      await member.save();
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        messId: user.messId,
      },
      member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};