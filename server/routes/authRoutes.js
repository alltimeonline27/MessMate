const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const { validateAuth } = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validateAuth, registerUser);

router.post("/login", loginUser);

module.exports = router;