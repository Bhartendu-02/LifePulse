const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const BloodBank = require('../models/BloodBank');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const { getCompatibleGroups } = require('../services/bloodCompatibility');
const { generateFirstAid } = require('../services/firstAidAi.service');

// Validation Helpers
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function isValidBloodGroup(group) {
  return typeof group === 'string' && VALID_BLOOD_GROUPS.includes(group.trim().toUpperCase());
}

function isValidPhone(phone) {
  return typeof phone === 'string' && /^[0-9+\-\s()]{7,15}$/.test(phone.trim());
}

/**
 * 1. GET /api/emergency/nearby
 * Finds nearest trauma centers & hospitals within radius using MongoDB's native 2dsphere $near query.
 * 
 * WHY WE DO NOT RE-SORT:
 * MongoDB's $near operator calculates spherical geometry distances on the earth's surface
 * and automatically returns matched documents sorted nearest-first. Re-sorting in application
 * code is redundant and risks breaking distance order.
 * 
 * WHY .lean() IS REQUIRED:
 * BloodBank.find().lean() returns plain JavaScript objects rather than Mongoose Documents.
 * This allows us to dynamically attach `matchedGroups` without Mongoose stripping it
 * during JSON serialization.
 */
router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius, bloodGroup } = req.query;

    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      return res.status(400).json({ message: 'Valid lat and lng query parameters are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Latitude must be between -90 and 90, and longitude between -180 and 180' });
    }

    if (bloodGroup && !isValidBloodGroup(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group parameter' });
    }

    const maxDistanceMeters = parseInt(radius, 10) || 15000; // default 15km

    // Execute Geospatial $near query (Coordinates order: [longitude, latitude])
    const hospitals = await BloodBank.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: maxDistanceMeters
        }
      }
    }).lean();

    // If bloodGroup is specified, filter by clinical compatibility
    let results = hospitals;
    if (bloodGroup) {
      const normalizedGroup = bloodGroup.trim().toUpperCase();
      const compatibleGroups = getCompatibleGroups(normalizedGroup);

      results = hospitals.filter(hospital => {
        const availableMatches = compatibleGroups.filter(
          grp => hospital.bloodUnits && hospital.bloodUnits[grp] > 0
        );
        hospital.matchedGroups = availableMatches;
        return availableMatches.length > 0;
      });
    }

    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * 2. GET /api/emergency/compatibility
 * Returns list of all clinically compatible blood groups for a given patient group.
 * Allows frontend to display recipient compatibility without touching the database.
 */
router.get('/compatibility', (req, res) => {
  const { group } = req.query;

  if (!group) {
    return res.status(400).json({ message: 'group query param is required' });
  }

  if (!isValidBloodGroup(group)) {
    return res.status(400).json({ message: 'Invalid blood group' });
  }

  try {
    const compatibleGroups = getCompatibleGroups(group);
    return res.status(200).json({
      patientGroup: group.trim().toUpperCase(),
      compatibleGroups
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * 3. POST /api/emergency/reserve
 * Atomically reserves/decrements blood units from a hospital's stock.
 * 
 * WHY ATOMIC findOneAndUpdate IS NON-NEGOTIABLE:
 * In road accidents where multiple ambulances or emergency centers may request rare blood (e.g. O-),
 * doing `findById` then `save()` creates a critical race condition (check-then-act flaw).
 * By combining the stock condition ({ 'bloodUnits.O-': { $gte: units } }) and decrement
 * ({ $inc: { 'bloodUnits.O-': -units } }) into a single atomic database operation,
 * MongoDB's document-level locking guarantees that two concurrent requests cannot allocate
 * the last remaining unit.
 */
router.post('/reserve', async (req, res, next) => {
  try {
    const { hospitalId, bloodGroup, units } = req.body;

    if (!hospitalId || !bloodGroup || units === undefined) {
      return res.status(400).json({ message: 'hospitalId, bloodGroup, and units are all required' });
    }

    const unitsToReserve = parseInt(units, 10);
    if (isNaN(unitsToReserve) || unitsToReserve <= 0) {
      return res.status(400).json({ message: 'units must be a positive integer' });
    }

    if (!isValidBloodGroup(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid hospital id format' });
    }

    const normalizedGroup = bloodGroup.trim().toUpperCase();
    const updateField = `bloodUnits.${normalizedGroup}`;

    const updatedHospital = await BloodBank.findOneAndUpdate(
      {
        _id: hospitalId,
        [updateField]: { $gte: unitsToReserve }
      },
      {
        $inc: { [updateField]: -unitsToReserve },
        $set: { lastUpdated: new Date() }
      },
      { new: true }
    );

    if (!updatedHospital) {
      return res.status(409).json({ message: 'Insufficient stock or hospital not found' });
    }

    return res.status(200).json({
      message: `Successfully reserved ${unitsToReserve} unit(s) of ${normalizedGroup}`,
      hospitalName: updatedHospital.hospitalName,
      remainingStock: updatedHospital.bloodUnits[normalizedGroup]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 4. POST /api/emergency/requests
 * Creates and broadcasts an urgent accident SOS blood request with 24h TTL.
 */
router.post('/requests', async (req, res, next) => {
  try {
    const {
      patientName,
      hospitalName,
      city,
      bloodGroupNeeded,
      unitsNeeded,
      urgency,
      contactPerson,
      contactPhone,
      caseDescription
    } = req.body;

    const missingFields = [];
    if (!patientName) missingFields.push('patientName');
    if (!hospitalName) missingFields.push('hospitalName');
    if (!city) missingFields.push('city');
    if (!bloodGroupNeeded) missingFields.push('bloodGroupNeeded');
    if (!contactPerson) missingFields.push('contactPerson');
    if (!contactPhone) missingFields.push('contactPhone');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (!isValidBloodGroup(bloodGroupNeeded)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    if (!isValidPhone(contactPhone)) {
      return res.status(400).json({ message: 'Invalid contact phone number format' });
    }

    const newRequest = new BloodRequest({
      patientName: patientName.trim(),
      hospitalName: hospitalName.trim(),
      city: city.trim(),
      bloodGroupNeeded: bloodGroupNeeded.trim().toUpperCase(),
      unitsNeeded: unitsNeeded ? Math.max(1, parseInt(unitsNeeded, 10)) : 1,
      urgency: ['CRITICAL', 'URGENT', 'MODERATE'].includes(urgency) ? urgency : 'CRITICAL',
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      caseDescription: caseDescription ? caseDescription.trim() : ''
    });

    const savedRequest = await newRequest.save();
    return res.status(201).json(savedRequest);
  } catch (error) {
    next(error);
  }
});

/**
 * 5. GET /api/emergency/requests
 * Fetches emergency blood requests sorted by clinical urgency and recency.
 * 
 * WHY WE DEFAULT TO OPEN REQUESTS:
 * In acute crises, responders and donors need immediate visibility of unresolved cases.
 * Showing fulfilled or closed requests by default adds cognitive clutter and delays life-saving help.
 */
router.get('/requests', async (req, res, next) => {
  try {
    const { city, status } = req.query;

    const filter = {
      status: status || 'OPEN'
    };

    if (city) {
      filter.city = new RegExp(city.trim(), 'i');
    }

    const requests = await BloodRequest.find(filter).lean();

    // Urgency sorting weight: CRITICAL (1) > URGENT (2) > MODERATE (3)
    const urgencyWeights = { CRITICAL: 1, URGENT: 2, MODERATE: 3 };

    requests.sort((a, b) => {
      const weightA = urgencyWeights[a.urgency] || 99;
      const weightB = urgencyWeights[b.urgency] || 99;

      if (weightA !== weightB) {
        return weightA - weightB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
});

/**
 * 6. PATCH /api/emergency/requests/:id/fulfill
 * Marks an SOS blood request as fulfilled.
 */
router.patch('/requests/:id/fulfill', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request id' });
    }

    const request = await BloodRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'OPEN') {
      return res.status(400).json({ message: `This request is already ${request.status}` });
    }

    request.status = 'FULFILLED';
    const updated = await request.save();

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * 7. POST /api/emergency/donors
 * Registers a citizen volunteer as a standby blood donor.
 */
router.post('/donors', async (req, res, next) => {
  try {
    const { name, bloodGroup, city, phone } = req.body;

    if (!name || !bloodGroup || !city || !phone) {
      return res.status(400).json({ message: 'name, bloodGroup, city, and phone are all required' });
    }

    if (!isValidBloodGroup(bloodGroup)) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    const donor = new Donor({
      name: name.trim(),
      bloodGroup: bloodGroup.trim().toUpperCase(),
      city: city.trim(),
      phone: phone.trim()
    });

    const savedDonor = await donor.save();
    return res.status(201).json(savedDonor);
  } catch (error) {
    next(error);
  }
});

/**
 * 8. GET /api/emergency/donors
 * Searches available standby donors by city and blood group.
 * Sorts by lastDonationDate ascending with first-time donors (null) first.
 */
router.get('/donors', async (req, res, next) => {
  try {
    const { city, bloodGroup } = req.query;

    const filter = { isAvailable: true };

    if (city) {
      filter.city = new RegExp(city.trim(), 'i');
    }

    if (bloodGroup) {
      if (!isValidBloodGroup(bloodGroup)) {
        return res.status(400).json({ message: 'Invalid blood group' });
      }
      filter.bloodGroup = bloodGroup.trim().toUpperCase();
    }

    const donors = await Donor.find(filter).lean();

    // Sort by lastDonationDate ascending with nulls (first-time donors) first
    donors.sort((a, b) => {
      if (!a.lastDonationDate && !b.lastDonationDate) return 0;
      if (!a.lastDonationDate) return -1;
      if (!b.lastDonationDate) return 1;
      return new Date(a.lastDonationDate) - new Date(b.lastDonationDate);
    });

    return res.status(200).json(donors);
  } catch (error) {
    next(error);
  }
});

/**
 * 9. POST /api/emergency/first-aid
 * Returns instant AI-guided trauma triage instructions powered by Gemini Flash.
 */
router.post('/first-aid', async (req, res) => {
  const { situation } = req.body;

  if (!situation || typeof situation !== 'string' || !situation.trim()) {
    return res.status(400).json({ message: 'situation is required' });
  }

  try {
    const advice = await generateFirstAid(situation.trim());
    return res.status(200).json({ advice });
  } catch (error) {
    return res.status(503).json({
      message: 'AI first-aid is temporarily unavailable. Call 108/102 immediately and follow standard first-aid: apply firm pressure to any bleeding, do not move someone with a suspected neck/spine injury, and keep the victim warm.'
    });
  }
});

module.exports = router;
