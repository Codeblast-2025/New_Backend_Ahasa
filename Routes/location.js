const express = require('express');
const router = express.Router();
const Location = require('../Models/Location');

// Save or update location
router.post('/', async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  try {
    await Location.findOneAndUpdate(
      { userId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// Get latest location by userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await Location.findOne({ userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

module.exports = router;
