const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    description: { type: String },
    sessionId: { type: String },
    successIndicator: { type: String },
    resultIndicator: { type: String },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'SUCCESS', 'FAILED'],
      default: 'CREATED'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
