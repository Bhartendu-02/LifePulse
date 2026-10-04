import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import NearbyHospitals from './pages/NearbyHospitals';
import RequestBlood from './pages/RequestBlood';
import DonorRegistry from './pages/DonorRegistry';
import FirstAid from './pages/FirstAid';

export default function App() {
  return (
    <div className="site-layout">
      {/* Healthcare Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/nearby" element={<NearbyHospitals />} />
          <Route path="/request-blood" element={<RequestBlood />} />
          <Route path="/donors" element={<DonorRegistry />} />
          <Route path="/first-aid" element={<FirstAid />} />
        </Routes>
      </main>

      {/* Healthcare Footer */}
      <Footer />
    </div>
  );
}
