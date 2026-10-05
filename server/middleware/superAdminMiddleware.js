const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authorized",
    });
  }

  if (req.user.role !== "superAdmin") {
    return res.status(403).json({
      message: "Super Admin access required",
    });
  }

  next();
};

module.exports = { superAdminOnly };