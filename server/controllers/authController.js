const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Mess = require("../models/Mess");

const generateToken = require("../utils/generateToken");
const generateMessId = require("../utils/generateMessId");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, messName } = req.body;

    if (!name || !email || !password || !messName) {
      return res.status(400).json({
        message: "Name, email, password and mess name are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let messId;
    let existingMess;

    do {
      messId = generateMessId();

      existingMess = await Mess.findOne({
        messId,
      });
    } while (existingMess);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const mess = await Mess.create({
      messId,
      name: messName,
      createdBy: user._id,
    });

    user.messId = mess._id;

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registration successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        messId: mess._id,
      },

      mess: {
        id: mess._id,
        messId: mess.messId,
        name: mess.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate(
      "messId",
      "messId name status"
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        messId: user.messId?._id || null,
      },

      mess: user.messId
        ? {
            id: user.messId._id,
            messId: user.messId.messId,
            name: user.messId.name,
            status: user.messId.status,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};