const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: String,
  photoURL: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Add points based on order total (1 point per 100 KES spent)
userSchema.methods.addLoyaltyPoints = async function(orderTotal) {
  const pointsToAdd = Math.floor(orderTotal / 100);
  this.loyaltyPoints += pointsToAdd;
  this.totalSpent += orderTotal;
  await this.save();
};

// Use points for discount (100 points = 1 KES discount)
userSchema.methods.useLoyaltyPoints = async function(points) {
  if (this.loyaltyPoints >= points) {
    this.loyaltyPoints -= points;
    await this.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema); 