const validateMember = (req, res, next) => {
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
      message: "Password must be at least 6 characters",
    });
  }

  next();
};

module.exports = {
  validateMember,
};