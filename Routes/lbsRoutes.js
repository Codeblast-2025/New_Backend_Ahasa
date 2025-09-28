const express = require('express');
const router = express.Router();
const { getLocation } = require('../controllers/locationController');

// Get location using LBS API
router.post('/request', getLocation);

module.exports = router;