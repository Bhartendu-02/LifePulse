# 🚑 LifePulse — Emergency Trauma & Blood Assistance Platform

> **Mission**: Rapid Golden-Hour road accident response — instant trauma hospital routing, live compatible blood stock verification, SOS broadcasting, and AI first-aid triage built on the MERN stack + Google Gemini.

---

## 🌟 Key Architecture & Features

- 📍 **Geospatial Proximity Search (`$near`)**: Native MongoDB `2dsphere` index calculates real-world spherical distances without paid Google Maps APIs.
- 🩸 **Clinical Blood-Compatibility Engine**: Immunohematology rules (e.g., patient with `B+` receives `B+`, `B-`, `O+`, `O-`).
- 🔒 **Atomic Concurrency Protection**: Race-condition-free reservations via MongoDB `$inc` + `$gte` condition locks.
- ⏳ **Automated 24h SOS Expiry**: Native MongoDB TTL (`expires: 86400`) background index clears stale emergency requests automatically.
- 🤖 **Gemini AI Trauma Triage**: Action-first, zero-fluff emergency first-aid prompt engineering with strict safety warnings and fallback protocols.
- 📞 **1-Tap Native Phone Dialers**: Immediate `tel:` protocol integration for instant ER, donor, and 108 ambulance dispatch.

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, React Router 7 | High-contrast, emergency-optimized mobile UI |
| **Styling** | Vanilla CSS Design System | Dark emergency theme (`--color-critical: #d32f2f`) |
| **Backend** | Node.js, Express.js | REST API, validation, error handlers |
| **Database** | MongoDB Atlas, Mongoose 8 | Geospatial indexing (`2dsphere`), TTL indexes |
| **AI Triage** | Google Gemini 1.5 Flash | Sub-second trauma stabilization guidance |
| **Device APIs** | Browser Geolocation API, `tel:` dialers | Real-time accident scene coordinates & rapid calls |

---

## 📁 Project Directory Structure

```
lifepulse/
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── api/axios.js        # Centralized Axios instance
│   │   ├── hooks/useGeolocation.js # Native high-accuracy GPS hook
│   │   ├── components/         # CallButton, HospitalCard, BloodStockBadge, SosRequestCard, DonorCard, SkeletonCard
│   │   ├── pages/              # Home, NearbyHospitals, RequestBlood, DonorRegistry, FirstAid
│   │   ├── App.jsx             # React Router definitions
│   │   ├── index.css           # High-contrast emergency CSS system
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
└── server/                     # Node.js + Express + Mongoose Backend
    ├── models/
    │   ├── BloodBank.js        # Hospital & 8 blood groups inventory + 2dsphere
    │   ├── BloodRequest.js     # SOS requests + 24h TTL index
    │   └── Donor.js            # Standby voluntary community donors
    ├── services/
    │   ├── bloodCompatibility.js # Clinical compatibility matrix
    │   └── firstAidAi.service.js # Gemini Flash emergency triage engine
    ├── routes/
    │   └── emergency.routes.js # All 10 emergency REST endpoints
    ├── scripts/
    │   └── seedEmergencyData.js # 10+ realistic hospitals (Delhi, Mumbai, BLR) + donors
    ├── .env / .env.example
    └── index.js                # Express entry point & global error middleware
```

---

## 🚀 Local Quickstart

### 1. Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run seed     # Seeds 10+ hospitals and donors into MongoDB
npm run dev      # Server starts on http://localhost:5000
```

### 2. Frontend Setup (New Terminal)
```bash
cd client
cp .env.example .env
npm install
npm run dev      # Client starts on http://localhost:5173
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Base API health check |
| `GET` | `/api/emergency/nearby` | Geospatial `$near` hospital & compatible blood search |
| `GET` | `/api/emergency/compatibility` | Blood group clinical compatibility matrix lookup |
| `POST` | `/api/emergency/reserve` | Atomic `$inc` stock reservation with concurrency lock |
| `POST` | `/api/emergency/requests` | Post 24h accident SOS blood broadcast |
| `GET` | `/api/emergency/requests` | Fetch open SOS requests sorted by urgency |
| `PATCH` | `/api/emergency/requests/:id/fulfill` | Mark SOS request as fulfilled |
| `POST` | `/api/emergency/donors` | Register as voluntary standby blood donor |
| `GET` | `/api/emergency/donors` | Search standby donors by city and blood group |
| `POST` | `/api/emergency/first-aid` | Gemini Flash accident trauma triage guidance |
