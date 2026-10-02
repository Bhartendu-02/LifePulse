require('dotenv').config();
const dns = require('dns');
if (process.env.NODE_ENV !== 'production') {
  // Use public DNS to resolve MongoDB Atlas SRV records smoothly on local dev environments
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during testing
    }
  },
  credentials: true
}));

app.use(express.json());

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LifePulse Emergency Trauma & Blood Assistance API is running'
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LifePulse Emergency Trauma & Blood Assistance API'
  });
});

// Mount Emergency Router
const emergencyRouter = require('./routes/emergency.routes');
app.use('/api/emergency', emergencyRouter);

// 404 Handler (must be registered AFTER all real routes)
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler (4 parameters required for Express error middleware)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled server error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lifepulse';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully to LifePulse'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 LifePulse server running on port ${PORT}`);
});

module.exports = app;
