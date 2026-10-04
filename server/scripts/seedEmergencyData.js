require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const BloodBank = require('../models/BloodBank');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');

/**
 * Standalone Emergency Seeder Script
 * Populates realistic hospitals, trauma centers, and voluntary standby donors
 * with verified real-world coordinates across Delhi, Mumbai, and Bengaluru.
 */

const HOSPITALS = [
  // Delhi NCR
  {
    hospitalName: 'AIIMS Apex Trauma Center',
    city: 'Delhi',
    address: 'Ring Road, Safdarjung Enclave, New Delhi',
    contactPhone: '011-26731000',
    emergencyHelpline: '102',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.5672] // [longitude, latitude]
    },
    googleMapsUrl: 'https://maps.google.com/?q=AIIMS+Apex+Trauma+Center+Delhi',
    bloodUnits: {
      'A+': 14, 'A-': 4, 'B+': 18, 'B-': 3, 'AB+': 8, 'AB-': 2, 'O+': 22, 'O-': 5
    }
  },
  {
    hospitalName: 'Safdarjung Hospital Emergency Care',
    city: 'Delhi',
    address: 'Ansari Nagar East, New Delhi',
    contactPhone: '011-26165060',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [77.2076, 28.5700]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Safdarjung+Hospital+Delhi',
    bloodUnits: {
      'A+': 10, 'A-': 2, 'B+': 12, 'B-': 1, 'AB+': 5, 'AB-': 0, 'O+': 15, 'O-': 2
    }
  },
  {
    hospitalName: 'Max Super Speciality Hospital Saket',
    city: 'Delhi',
    address: '1, 2 Press Enclave Marg, Saket, New Delhi',
    contactPhone: '011-26515050',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [77.2132, 28.5284]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Max+Hospital+Saket',
    bloodUnits: {
      'A+': 8, 'A-': 1, 'B+': 11, 'B-': 2, 'AB+': 4, 'AB-': 1, 'O+': 9, 'O-': 0
    }
  },
  {
    hospitalName: 'Delhi Heart & Lung Institute (Non-Trauma Unit)',
    city: 'Delhi',
    address: 'Panchkuian Road, New Delhi',
    contactPhone: '011-42999999',
    emergencyHelpline: '108',
    hasTraumaICU: false, // Testing the "No Trauma ICU" warning badge
    location: {
      type: 'Point',
      coordinates: [77.2030, 28.6410]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Delhi+Heart+Lung+Institute',
    bloodUnits: {
      'A+': 3, 'A-': 0, 'B+': 4, 'B-': 0, 'AB+': 2, 'AB-': 0, 'O+': 5, 'O-': 0
    }
  },

  // Mumbai
  {
    hospitalName: 'KEM Hospital & Trauma Center',
    city: 'Mumbai',
    address: 'Acharya Donde Marg, Parel, Mumbai',
    contactPhone: '022-24107000',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [72.8427, 19.0019] // [longitude, latitude]
    },
    googleMapsUrl: 'https://maps.google.com/?q=KEM+Hospital+Mumbai',
    bloodUnits: {
      'A+': 12, 'A-': 3, 'B+': 16, 'B-': 2, 'AB+': 6, 'AB-': 1, 'O+': 20, 'O-': 4
    }
  },
  {
    hospitalName: 'Lilavati Hospital & Research Centre',
    city: 'Mumbai',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
    contactPhone: '022-26751000',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [72.8295, 19.0515]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Lilavati+Hospital+Mumbai',
    bloodUnits: {
      'A+': 9, 'A-': 2, 'B+': 8, 'B-': 1, 'AB+': 4, 'AB-': 0, 'O+': 11, 'O-': 1
    }
  },
  {
    hospitalName: 'Hinduja Healthcare Surgical',
    city: 'Mumbai',
    address: '11th Road, Khar West, Mumbai',
    contactPhone: '022-26469999',
    emergencyHelpline: '108',
    hasTraumaICU: false,
    location: {
      type: 'Point',
      coordinates: [72.8354, 19.0707]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Hinduja+Healthcare+Khar',
    bloodUnits: {
      'A+': 4, 'A-': 0, 'B+': 5, 'B-': 1, 'AB+': 2, 'AB-': 0, 'O+': 6, 'O-': 0
    }
  },

  // Bengaluru
  {
    hospitalName: 'NIMHANS Emergency & Trauma Center',
    city: 'Bengaluru',
    address: 'Hosur Road, Lakkasandra, Bengaluru',
    contactPhone: '080-26995000',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [77.5993, 12.9362] // [longitude, latitude]
    },
    googleMapsUrl: 'https://maps.google.com/?q=NIMHANS+Trauma+Center+Bengaluru',
    bloodUnits: {
      'A+': 15, 'A-': 3, 'B+': 14, 'B-': 4, 'AB+': 7, 'AB-': 2, 'O+': 25, 'O-': 6
    }
  },
  {
    hospitalName: 'Manipal Hospital Hal Airport Road',
    city: 'Bengaluru',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    contactPhone: '080-25024444',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [77.6521, 12.9592]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Manipal+Hospital+Old+Airport+Road+Bengaluru',
    bloodUnits: {
      'A+': 11, 'A-': 1, 'B+': 13, 'B-': 2, 'AB+': 5, 'AB-': 1, 'O+': 14, 'O-': 3
    }
  },
  {
    hospitalName: 'Victoria Hospital Emergency Ward',
    city: 'Bengaluru',
    address: 'Near City Market, Fort, Bengaluru',
    contactPhone: '080-26701150',
    emergencyHelpline: '108',
    hasTraumaICU: true,
    location: {
      type: 'Point',
      coordinates: [77.5753, 12.9634]
    },
    googleMapsUrl: 'https://maps.google.com/?q=Victoria+Hospital+Bengaluru',
    bloodUnits: {
      'A+': 7, 'A-': 0, 'B+': 9, 'B-': 1, 'AB+': 3, 'AB-': 0, 'O+': 10, 'O-': 1
    }
  }
];

const DONORS = [
  {
    name: 'Aarav Sharma',
    bloodGroup: 'O-',
    city: 'Delhi',
    phone: '+91-9811223344',
    isAvailable: true,
    lastDonationDate: null // First-time donor
  },
  {
    name: 'Priya Verma',
    bloodGroup: 'B+',
    city: 'Delhi',
    phone: '+91-9877665544',
    isAvailable: true,
    lastDonationDate: new Date('2026-05-15')
  },
  {
    name: 'Rohan Deshmukh',
    bloodGroup: 'AB-',
    city: 'Mumbai',
    phone: '+91-9822334455',
    isAvailable: true,
    lastDonationDate: null
  },
  {
    name: 'Ananya Iyer',
    bloodGroup: 'A+',
    city: 'Mumbai',
    phone: '+91-9833445566',
    isAvailable: true,
    lastDonationDate: new Date('2026-06-10')
  },
  {
    name: 'Karthik Gowda',
    bloodGroup: 'O+',
    city: 'Bengaluru',
    phone: '+91-9844556677',
    isAvailable: true,
    lastDonationDate: null
  },
  {
    name: 'Meera Nair',
    bloodGroup: 'B-',
    city: 'Bengaluru',
    phone: '+91-9855667788',
    isAvailable: true,
    lastDonationDate: new Date('2026-04-20')
  },
  {
    name: 'Siddharth Malhotra',
    bloodGroup: 'A-',
    city: 'Delhi',
    phone: '+91-9866778899',
    isAvailable: true,
    lastDonationDate: new Date('2026-03-01')
  },
  {
    name: 'Tanvi Kulkarni',
    bloodGroup: 'AB+',
    city: 'Mumbai',
    phone: '+91-9877889900',
    isAvailable: true,
    lastDonationDate: null
  }
];

const SAMPLE_REQUESTS = [
  {
    patientName: 'Vikram Joshi (Bike Trauma)',
    hospitalName: 'AIIMS Apex Trauma Center',
    city: 'Delhi',
    bloodGroupNeeded: 'O-',
    unitsNeeded: 3,
    urgency: 'CRITICAL',
    contactPerson: 'Dr. R. Kapoor (ER Senior Resident)',
    contactPhone: '+91-9811001122',
    caseDescription: 'Highway motorcycle collision, acute femoral hemorrhage. Immediate transfusion required in OR #2.',
    status: 'OPEN'
  },
  {
    patientName: 'Sunita Rao',
    hospitalName: 'KEM Hospital & Trauma Center',
    city: 'Mumbai',
    bloodGroupNeeded: 'B-',
    unitsNeeded: 2,
    urgency: 'URGENT',
    contactPerson: 'Mahesh Rao (Brother)',
    contactPhone: '+91-9822002233',
    caseDescription: 'Auto-rickshaw accident victim, internal thoracic injury. Surgery scheduled in 45 minutes.',
    status: 'OPEN'
  }
];

async function seedData() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifepulse';

  try {
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing records
    await BloodBank.deleteMany({});
    await Donor.deleteMany({});
    await BloodRequest.deleteMany({});
    console.log('🗑️ Cleared existing BloodBank, Donor, and BloodRequest collections');

    // Insert new records
    const insertedHospitals = await BloodBank.insertMany(HOSPITALS);
    console.log(`🏥 Seeded ${insertedHospitals.length} hospitals with GeoJSON 2dsphere coordinates`);

    const insertedDonors = await Donor.insertMany(DONORS);
    console.log(`🩸 Seeded ${insertedDonors.length} standby voluntary donors`);

    const insertedRequests = await BloodRequest.insertMany(SAMPLE_REQUESTS);
    console.log(`🚨 Seeded ${insertedRequests.length} active emergency SOS requests`);

    console.log('✅ Emergency database successfully seeded!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

seedData();
