const mongoose = require('mongoose');

/**
 * BloodRequest Schema
 * Represents urgent accident/trauma SOS requests posted by bystanders, families, or ER doctors.
 * 
 * HOW THE TTL (Time-To-Live) INDEX WORKS:
 * The `expires: 86400` option on `createdAt` creates a MongoDB TTL index.
 * MongoDB runs an internal background thread roughly every 60 seconds that deletes
 * documents whose age exceeds 86,400 seconds (24 hours).
 * Because the sweep runs periodically, documents are not deleted at the exact second,
 * but within a 60-second window. This ensures the emergency feed never shows stale,
 * days-old requests during an acute crisis.
 */
const bloodRequestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  bloodGroupNeeded: {
    type: String,
    required: [true, 'Blood group needed is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    trim: true
  },
  unitsNeeded: {
    type: Number,
    default: 1,
    min: 1
  },
  urgency: {
    type: String,
    enum: ['CRITICAL', 'URGENT', 'MODERATE'],
    default: 'CRITICAL'
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true
  },
  caseDescription: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'FULFILLED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24-hour TTL index auto-deletion
  }
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
