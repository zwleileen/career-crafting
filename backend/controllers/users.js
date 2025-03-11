const express = require("express");
const router = express.Router();

const User = require("../models/User");

const verifyToken = require("../middleware/verify-token");

router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "username");

    res.json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/:userId", verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ err: "Unauthorized" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ err: "User not found." });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/updateStatus", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (req.user._id !== userId) {
      return res
        .status(403)
        .json({
          message: "Unauthorized: Cannot update another user's status.",
        });
    }

    const updatedStatus = await User.findByIdAndUpdate(
      userId,
      { status: "paid" },
      { new: true }
    );

    if (!updatedStatus) {
      return res
        .status(404)
        .json({ message: "No user found with the given User ID." });
    }

    res.status(200).json({
      message: "User status successfully updated",
      updatedStatus,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
  }
});

module.exports = router;
