const express = require("express");
const router = express.Router();
// const User = require("../models/User");
const mongoose = require('mongoose');
const User = mongoose.models.User || require('../models/User');

// PUT /api/auth/user/:id — update user
router.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;
