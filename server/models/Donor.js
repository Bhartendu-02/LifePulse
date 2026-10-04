const mongoose = require('mongoose');

/**
 * Donor Schema
 * Represents voluntary community blood donors on standby for emergency transfusions.
 */
const donorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'Blood group is required'],
    index: true,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    index: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donor', donorSchema);
