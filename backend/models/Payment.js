const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  paymentMethod: {
    type: String,
    enum: ['MPESA'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  mpesaReference: {
    type: String,
    unique: true
  },
  checkoutRequestId: String,
  merchantRequestId: String,
  phoneNumber: {
    type: String,
    required: true
  },
  errorMessage: String,
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema); 