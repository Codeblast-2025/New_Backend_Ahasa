const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users from the same country (case insensitive)
router.post('/all', async (req, res) => {
  const { country } = req.body;

  if (!country) return res.status(400).json({ error: 'Country is required' });

  try {
    const users = await User.find({
      country: { $regex: `^${country}$`, $options: 'i' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get nearby users (same location, exclude self, case insensitive)
router.post('/nearby', async (req, res) => {
  const { country, location, userId } = req.body;

  if (!country || !location || !userId)
    return res.status(400).json({ error: 'Country, location, and userId are required' });

  try {
    const users = await User.find({
      country: { $regex: `^${country}$`, $options: 'i' },
      location: { $regex: `^${location}$`, $options: 'i' },
      userId: { $ne: userId }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
