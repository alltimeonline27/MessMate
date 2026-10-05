const validateAuth = (req, res, next) => {
  const { name, email, password, messName } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (req.path === "/register") {
    if (!name) {
      return res.status(400).json({
        message: "Name is required for registration",
      });
    }

    if (!messName) {
      return res.status(400).json({
        message: "Mess name is required for registration",
      });
    }
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  next();
};

module.exports = { validateAuth };