const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', LocationSchema);
