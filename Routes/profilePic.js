
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const User = mongoose.models.User || require('../Models/User');

const router = express.Router();
const storage = multer.memoryStorage(); // store in memory
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// PUT /api/auth/user/:id/profile-pic
router.put('/user/:id/profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert to base64
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: base64 },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
