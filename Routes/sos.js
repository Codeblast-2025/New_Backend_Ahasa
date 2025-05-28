const express = require('express');
const router = express.Router();
const UserLocation = require('../models/UserLocation');

// Save or update user location
router.post('/update-location', async (req, res) => {
  const { userId, latitude, longitude } = req.body;

  if (!userId || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const updated = await UserLocation.findOneAndUpdate(
      { userId },
      {
        coordinates: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Find nearby users
router.post('/nearby', async (req, res) => {
  const { latitude, longitude, maxDistanceKm } = req.body;

  if (latitude === undefined || longitude === undefined || maxDistanceKm === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const nearby = await UserLocation.find({
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: maxDistanceKm * 1000 // meters
        }
      }
    });

    res.status(200).json({ success: true, data: nearby });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
