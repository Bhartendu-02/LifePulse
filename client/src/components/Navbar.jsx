import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span style={{ fontSize: '1.4rem' }}>🩸</span>
          <div>
            <span className="brand-title">LifePulse</span>
            <span className="brand-subtitle">Blood Bank & Emergency Network</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/nearby"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Find Hospitals
          </NavLink>
          <NavLink
            to="/request-blood"
            className={({ isActive }) => `nav-item nav-sos-item ${isActive ? 'active' : ''}`}
          >
            Emergency Requests
          </NavLink>
          <NavLink
            to="/donors"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Volunteer Donors
          </NavLink>
          <NavLink
            to="/first-aid"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            First Aid Guide
          </NavLink>
        </div>

        {/* 108 Emergency Action */}
        <div>
          <a
            href="tel:108"
            className="navbar-emergency-btn"
            title="Dial 108 for Emergency Ambulance"
          >
            <span>🚑 Call 108 Ambulance</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
