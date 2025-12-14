const express = require("express");
const bcrypt = require("bcrypt");
require("dotenv").config();
const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validation");
const { User } = require("../models/user");
const authRouter = express.Router();
const parsedSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
const saltRounds =
  Number.isFinite(parsedSaltRounds) && parsedSaltRounds > 0
    ? parsedSaltRounds
    : 10;
authRouter.post("/api/auth/register", async (req, res) => {
  try {
    validateSignupData(req.body);
    const { firstName, lastName, emailId, password } = req.body;
    // Prevent duplicate registrations for same email
    const existing = await User.findOne({ emailId });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = new User({
      firstName,
      lastName,
      emailId,
      passwordHash,
    });
    await user.save();
    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res
      .status(201)
      .json({ message: "User signed up successfully", user: safeUser });
  } catch (e) {
    const message = e && e.message ? e.message : "Registration failed";
    res.status(400).json({ error: message });
  }
});

authRouter.post("/api/auth/login", async (req, res) => {
  try {
    validateLoginData(req.body);
    const { emailId, password } = req.body;

    // Find user by email
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password with stored passwordHash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({ message: "Login successful", user: safeUser });
  } catch (e) {
    const message = e && e.message ? e.message : "Login failed";
    res.status(400).json({ error: message });
  }
});

module.exports = { authRouter };
