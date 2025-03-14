const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendAuthEmail = require("../services/emailService");

const saltRounds = 12;

router.post("/sign-up", async (req, res) => {
  try {
    const { email, password, gender } = req.body;
    const userInDatabase = await User.findOne({ email: req.body.email });

    if (userInDatabase) {
      return res.status(409).json({ err: "Username already taken." });
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const user = await User.create({
      email,
      hashedPassword,
      gender,
      verified: false,
    });

    // const payload = {
    //   username: user.username,
    //   _id: user._id,
    //   gender: user.gender,
    //   status: user.status,
    // };

    //token generated for email auth
    const emailToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${emailToken}`;
    await sendAuthEmail(user.email, verificationUrl);

    res.status(201).json({
      message: "Sign-up successful. Check your email to verify your account.",
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ err: "Verification token is required." });
    }

    //decodes the email token only, not the same as the Bearer token for access to the features
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.email) {
      return res.status(400).json({ err: "Invalid or expired token." });
    }

    // Find and update user to verified
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ err: "User not found." });
    }

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: "Invalid credentials." });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ err: "Please verify your email before logging in." });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        err: "Invalid credentials. Please check your username and password.",
      });
    }

    const payload = {
      email: user.email,
      _id: user._id,
      gender: user.gender,
      status: user.status,
    };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/refresh-token/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(401).json({ err: "Invalid credentials." });
    }

    const payload = {
      email: user.email,
      _id: user._id,
      gender: user.gender,
      status: user.status,
    };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
