const mongoose = require('mongoose');

/**
 * BloodBank Schema
 * Represents a trauma-ready hospital or blood bank facility with live inventory
 * and geospatial location data.
 * 
 * CRITICAL NOTE ON GEOJSON COORDINATES ORDER:
 * GeoJSON standard requires coordinates in [longitude, latitude] order (X then Y axis).
 * This is the reverse of colloquial speech ("lat/long").
 * Longitude ranges from -180 to 180, while Latitude ranges from -90 to 90.
 * Inverting this order fails silently and causes geospatial distance queries ($near)
 * to compute meaningless locations.
 */
const bloodBankSchema = new mongoose.Schema({
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
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true
  },
  emergencyHelpline: {
    type: String,
    default: '108',
    trim: true
  },
  hasTraumaICU: {
    type: Boolean,
    default: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  googleMapsUrl: {
    type: String,
    trim: true
  },
  bloodUnits: {
    'A+': { type: Number, default: 0, min: 0 },
    'A-': { type: Number, default: 0, min: 0 },
    'B+': { type: Number, default: 0, min: 0 },
    'B-': { type: Number, default: 0, min: 0 },
    'AB+': { type: Number, default: 0, min: 0 },
    'AB-': { type: Number, default: 0, min: 0 },
    'O+': { type: Number, default: 0, min: 0 },
    'O-': { type: Number, default: 0, min: 0 }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Geospatial 2dsphere index for radius proximity search ($near, $geoNear)
bloodBankSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodBank', bloodBankSchema);
