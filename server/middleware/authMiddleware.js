const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("messId", "messId name status");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "User account is inactive",
      });
    }

    if (
      user.role !== "superAdmin" &&
      !user.messId
    ) {
      return res.status(403).json({
        message: "User is not associated with any mess",
      });
    }

    if (
      user.role !== "superAdmin" &&
      user.messId.status !== "active"
    ) {
      return res.status(403).json({
        message: "This mess is inactive",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, invalid token",
    });
  }
};

module.exports = { protect };