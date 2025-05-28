const mongoose = require('mongoose');

const userLocationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userLocationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('UserLocation', userLocationSchema);
